import { assignNearestProvider, bookingsTable, db, notificationsTable, providersTable, servicesTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { bookingQueue } from "../lib/queue";
import { RAZORPAY_KEY_ID, createRazorpayOrder } from "../lib/razorpay";
import { clearPendingLead, emitToUser, getIO, markPendingLead, vendorSockets } from "../lib/socket";

const DEFAULT_LAT = 12.9716;
const DEFAULT_LNG = 77.5946;
const LEAD_TIMEOUT_MS = 30000;

const router: IRouter = Router();

bookingQueue.process("vendor-assignment", async ({ bookingId, userId, serviceName, providerName }) => {
  await new Promise((r) => setTimeout(r, 4000));
  const [updated] = await db
    .update(bookingsTable)
    .set({ status: "accepted" })
    .where(eq(bookingsTable.id, bookingId))
    .returning();
  if (!updated) return;

  emitToUser(userId, "booking:status", { bookingId, status: "accepted" });

  await db.insert(notificationsTable).values({
    userId,
    type: "booking_accepted",
    icon: "user-check",
    iconColor: "#3b82f6",
    title: "Provider On The Way!",
    body: `${providerName} has accepted your ${serviceName} booking and will arrive as scheduled.`,
    read: false,
    bookingId,
  });
});

bookingQueue.process("start-service", async ({ bookingId, userId, serviceName }) => {
  await new Promise((r) => setTimeout(r, 3000));
  await db
    .update(bookingsTable)
    .set({ status: "in_progress" })
    .where(eq(bookingsTable.id, bookingId));
  emitToUser(userId, "booking:status", { bookingId, status: "in_progress" });
});

router.get("/bookings", async (req, res): Promise<void> => {
  const { userId } = req.query;
  const rows = await (userId
    ? db
        .select()
        .from(bookingsTable)
        .where(eq(bookingsTable.userId, String(userId)))
        .orderBy(bookingsTable.createdAt)
    : db.select().from(bookingsTable).orderBy(bookingsTable.createdAt));
  res.json(rows);
});

router.post("/bookings", async (req, res): Promise<void> => {
  const { userId, serviceId, providerId, date, time, address, price, paymentIntentId } = req.body;
  if (!userId || !serviceId || !providerId || !date || !time || !address || price == null) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [service] = await db
    .select()
    .from(servicesTable)
    .where(eq(servicesTable.id, Number(serviceId)));
  const [provider] = await db
    .select()
    .from(providersTable)
    .where(eq(providersTable.id, Number(providerId)));

  if (!service || !provider) {
    res.status(400).json({ error: "Service or provider not found" });
    return;
  }

  const [booking] = await db
    .insert(bookingsTable)
    .values({
      userId: String(userId),
      serviceId: Number(serviceId),
      serviceName: service.name,
      providerId: Number(providerId),
      providerName: provider.name,
      providerInitials: provider.initials,
      date: String(date),
      time: String(time),
      address: String(address),
      price: Number(price),
      platformFee: 29,
      status: "pending",
      paymentIntentId: paymentIntentId ? String(paymentIntentId) : null,
    })
    .returning();

  const formattedDate = new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

  await db.insert(notificationsTable).values({
    userId: String(userId),
    type: "booking_confirmed",
    icon: "check-circle",
    iconColor: "#22c55e",
    title: "Booking Confirmed!",
    body: `Your ${service.name} with ${provider.name} is confirmed for ${formattedDate} at ${time}.`,
    read: false,
    bookingId: booking.id,
  });

  emitToUser(String(userId), "booking:status", { bookingId: booking.id, status: "pending" });

  // Create Razorpay order (no-op when keys are not set)
  const rzpOrder = await createRazorpayOrder(
    booking.price + booking.platformFee,
    `booking_${booking.id}`,
  );
  if (rzpOrder) {
    await db
      .update(bookingsTable)
      .set({ razorpayOrderId: rzpOrder.id })
      .where(eq(bookingsTable.id, booking.id));
  }

  // Attempt real-time dispatch to nearest online vendor
  const matchResult = await assignNearestProvider(service.category, DEFAULT_LAT, DEFAULT_LNG);

  if (matchResult.success) {
    const vendorSocketId = vendorSockets.get(matchResult.provider.id);
    if (vendorSocketId) {
      const leadPayload = {
        bookingId: booking.id,
        serviceName: service.name,
        category: service.category,
        providerName: provider.name,
        date: booking.date,
        time: booking.time,
        address: booking.address,
        price: booking.price,
        userId: String(userId),
        providerId: matchResult.provider.id,
        distanceKm: matchResult.distanceKm,
      };
      getIO()?.to(vendorSocketId).emit("NEW_LEAD", leadPayload);
      markPendingLead(booking.id, LEAD_TIMEOUT_MS, () => {
        bookingQueue.add(
          "vendor-assignment",
          {
            bookingId: booking.id,
            userId: String(userId),
            serviceName: service.name,
            providerName: provider.name,
          },
          { delay: 0 },
        );
      });
    } else {
      clearPendingLead(booking.id);
      bookingQueue.add("vendor-assignment", {
        bookingId: booking.id,
        userId: String(userId),
        serviceName: service.name,
        providerName: provider.name,
      });
    }
  } else {
    bookingQueue.add("vendor-assignment", {
      bookingId: booking.id,
      userId: String(userId),
      serviceName: service.name,
      providerName: provider.name,
    }, { delay: 1000 });
  }

  res.status(201).json({
    ...booking,
    razorpayOrderId: rzpOrder?.id ?? null,
    razorpayAmount: rzpOrder?.amount ?? null,
    razorpayKeyId: RAZORPAY_KEY_ID,
  });
});

router.get("/bookings/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid booking ID" });
    return;
  }
  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, id));
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json(booking);
});

router.patch("/bookings/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid booking ID" });
    return;
  }

  const { status, rating } = req.body;
  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;
  if (rating !== undefined) updates.rating = rating;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }

  const [booking] = await db
    .update(bookingsTable)
    .set(updates)
    .where(eq(bookingsTable.id, id))
    .returning();

  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  emitToUser(booking.userId, "booking:status", { bookingId: id, status: booking.status });

  if (status === "cancelled") {
    await db.insert(notificationsTable).values({
      userId: booking.userId,
      type: "booking_cancelled",
      icon: "x-circle",
      iconColor: "#ef4444",
      title: "Booking Cancelled",
      body: `Your ${booking.serviceName} booking has been cancelled.`,
      read: false,
      bookingId: booking.id,
    });
  } else if (status === "completed" && !booking.rating) {
    await db.insert(notificationsTable).values({
      userId: booking.userId,
      type: "rating_request",
      icon: "star",
      iconColor: "#f59e0b",
      title: "Rate Your Experience",
      body: `How was your ${booking.serviceName} with ${booking.providerName}? Tap to rate.`,
      read: false,
      bookingId: booking.id,
    });
  } else if (status === "in_progress") {
    bookingQueue.add("start-service", {
      bookingId: id,
      userId: booking.userId,
      serviceName: booking.serviceName,
      providerName: booking.providerName,
    }, { delay: 0 });
  }

  res.json(booking);
});

export default router;

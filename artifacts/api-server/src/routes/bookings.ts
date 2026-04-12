import { bookingsTable, db, notificationsTable, providersTable, servicesTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";

const router: IRouter = Router();

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
  const { userId, serviceId, providerId, date, time, address, price } = req.body;
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
      status: "upcoming",
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

  res.status(201).json(booking);
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
  }

  res.json(booking);
});

export default router;

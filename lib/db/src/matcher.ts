import { db } from "./db"; // Your database connection
import { providers, bookings } from "./schema";
import { eq, and } from "drizzle-orm";

export async function assignNearestProvider(bookingId: number, serviceType: string, userLat: number, userLng: number) {
  // 1. Get all providers for this service who are 'Online'
  const availableProviders = await db.select().from(providers).where(
    and(
      eq(providers.serviceType, serviceType),
      eq(providers.isOnline, true)
    )
  );

  if (availableProviders.length === 0) {
    return { success: false, message: "No providers available" };
  }

  // 2. Simple Math to find the closest one (Shortest distance)
  // In a full Uber-style app, we'd use Google Maps API here, 
  // but for now, we'll find the mathematically closest provider.
  let closest = availableProviders[0];
  let minDistance = Math.sqrt(
    Math.pow(closest.lat - userLat, 2) + Math.pow(closest.lng - userLng, 2)
  );

  for (const provider of availableProviders) {
    const dist = Math.sqrt(
      Math.pow(provider.lat - userLat, 2) + Math.pow(provider.lng - userLng, 2)
    );
    if (dist < minDistance) {
      minDistance = dist;
      closest = provider;
    }
  }

  // 3. Assign this provider to the booking in the database
  await db.update(bookings)
    .set({ providerId: closest.id, status: "assigned" })
    .where(eq(bookings.id, bookingId));

  return { success: true, provider: closest };
}
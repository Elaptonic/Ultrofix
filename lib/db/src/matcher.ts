import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { providersTable } from "./schema";

export interface NearestProviderResult {
  success: true;
  provider: typeof providersTable.$inferSelect;
  distanceDeg: number;
}

export interface NoProviderResult {
  success: false;
  message: string;
}

export type AssignResult = NearestProviderResult | NoProviderResult;

export async function assignNearestProvider(
  serviceCategory: string,
  userLat: number,
  userLng: number,
): Promise<AssignResult> {
  const available = await db
    .select()
    .from(providersTable)
    .where(
      and(
        eq(providersTable.category, serviceCategory),
        eq(providersTable.isOnline, true),
      ),
    );

  if (available.length === 0) {
    return { success: false, message: "No providers available" };
  }

  let closest = available[0]!;
  let minDist =
    Math.pow(closest.latitude - userLat, 2) +
    Math.pow(closest.longitude - userLng, 2);

  for (const p of available) {
    const d =
      Math.pow(p.latitude - userLat, 2) + Math.pow(p.longitude - userLng, 2);
    if (d < minDist) {
      minDist = d;
      closest = p;
    }
  }

  return { success: true, provider: closest, distanceDeg: Math.sqrt(minDist) };
}
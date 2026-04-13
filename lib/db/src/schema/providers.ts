import { boolean, integer, pgTable, real, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const providersTable = pgTable("providers", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  initials: text("initials").notNull(),
  rating: real("rating").notNull().default(4.5),
  reviewCount: integer("review_count").notNull().default(0),
  jobsCompleted: integer("jobs_completed").notNull().default(0),
  specializations: text("specializations").array().notNull().default([]),
  experience: text("experience").notNull(),
  verified: boolean("verified").notNull().default(true),
  category: text("category").notNull(),
  latitude: real("latitude").notNull().default(12.9716),
  longitude: real("longitude").notNull().default(77.5946),
  isOnline: boolean("is_online").notNull().default(true),
});

export const insertProviderSchema = createInsertSchema(providersTable).omit({ id: true });
export type InsertProvider = z.infer<typeof insertProviderSchema>;
export type Provider = typeof providersTable.$inferSelect;

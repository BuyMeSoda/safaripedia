import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const generations = pgTable("generations", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const trips = pgTable("trips", {
  id: text("id").primaryKey(),
  prompt: text("prompt").notNull(),
  itinerary: text("itinerary").notNull(),
  costData: text("cost_data"),
  wildlifeData: text("wildlife_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGenerationSchema = createInsertSchema(generations).pick({
  prompt: true,
  response: true,
});

export const insertTripSchema = createInsertSchema(trips).pick({
  id: true,
  prompt: true,
  itinerary: true,
  costData: true,
  wildlifeData: true,
});

export type InsertGeneration = z.infer<typeof insertGenerationSchema>;
export type Generation = typeof generations.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;
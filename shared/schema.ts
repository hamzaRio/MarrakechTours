import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Price in MAD
  imageUrl: text("image_url").notNull(),
  featured: boolean("featured").default(true),
  getYourGuidePrice: integer("get_your_guide_price"), // Optional reference price
});

export const insertActivitySchema = createInsertSchema(activities).omit({ 
  id: true 
});

// Define bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  activityId: integer("activity_id").notNull(),
  date: text("date").notNull(),
  people: integer("people").notNull(),
  notes: text("notes"),
  status: text("status").default("pending"), // pending, confirmed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({ 
  id: true, 
  createdAt: true, 
  status: true 
});

// Define users table (for admin authentication)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // admin or superadmin
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true 
});

// Define an audit log for admin actions
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  details: json("details"), // Stores the details of what was changed
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ 
  id: true, 
  timestamp: true 
});

// Type definitions
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Extended schemas for validation
export const bookingFormSchema = insertBookingSchema.extend({
  activity: z.string().min(1, "Please select an activity"),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginData = z.infer<typeof loginSchema>;

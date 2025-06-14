import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Price in MAD
  image: text("image").notNull(),
  featured: boolean("featured").default(true),
  available: boolean("available").default(true), // Whether the activity is available for booking
  getYourGuidePrice: integer("get_your_guide_price"), // Optional reference price
  durationHours: integer("duration_hours"),
  includesFood: boolean("includes_food").default(false),
  includesTransportation: boolean("includes_transportation").default(false),
  maxGroupSize: integer("max_group_size"),
  priceType: text("price_type").default("per_person"), // 'fixed' or 'per_person'
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
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
  crmReference: text("crm_reference"), // Reference ID in the CRM system
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({ 
  id: true, 
  createdAt: true
});

// Define users table (for admin authentication)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // admin or superadmin
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true,
  lastLogin: true
});

// Define an audit log for admin actions
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(), // CREATE, UPDATE, DELETE, LOGIN
  entityType: text("entity_type"), // activity, booking, user
  entityId: integer("entity_id"),
  details: json("details"), // Stores the details of what was changed
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ 
  id: true, 
  createdAt: true 
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

// Extended types used on the frontend
export type ActivityWithImageUrl = Activity & { imageUrl?: string };

export type ExtendedActivity = ActivityWithImageUrl;

// Validation schema for creating or updating activities
export const activitySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be a positive number'),
  image: z.string().url('Must be a valid URL to an image'),
  durationHours: z.coerce.number().positive('Duration must be positive').optional(),
  includesFood: z.boolean().optional(),
  includesTransportation: z.boolean().optional(),
  maxGroupSize: z.coerce.number().positive('Group size must be positive').optional(),
  priceType: z.enum(['fixed', 'per_person']).optional(),
});

export type ActivityFormData = z.infer<typeof activitySchema>;

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

// Availability types
export enum AvailabilityStatus {
  AVAILABLE = "available",
  LIMITED = "limited",
  UNAVAILABLE = "unavailable"
}

export interface ActivityAvailability {
  date: string;  // ISO format date string (YYYY-MM-DD)
  activityId: number;
  status: AvailabilityStatus;
  spotsRemaining?: number;  // Optional field to show how many spots are left
}

export interface DateAvailability {
  date: string;
  status: AvailabilityStatus;
  activitiesStatus: {
    [activityId: number]: AvailabilityStatus;
  };
}

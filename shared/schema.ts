import { z } from 'zod';

// Basic activity interface used across the app
export interface Activity {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  featured?: boolean | null;
  available?: boolean | null;
  getYourGuidePrice?: number | null;
  durationHours?: number | null;
  includesFood?: boolean | null;
  includesTransportation?: boolean | null;
  maxGroupSize?: number | null;
  priceType?: 'fixed' | 'per_person' | null;
  createdBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Type for creating a new activity
export type InsertActivity = Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>;

// Booking interfaces
export interface Booking {
  id: number;
  name: string;
  phone: string;
  activityId: number;
  date: string;
  people: number;
  notes?: string | null;
  status?: string;
  crmReference?: string | null;
  createdAt?: Date;
}

export type InsertBooking = Omit<Booking, 'id' | 'createdAt'>;

// User interfaces
export interface User {
  id: number;
  username: string;
  password: string;
  role: string;
  createdAt: Date | null;
  lastLogin?: Date | null;
}

export type InsertUser = Omit<User, 'id' | 'createdAt' | 'lastLogin'>;

// Audit log interfaces
export interface AuditLog {
  id: number;
  userId: number;
  action: string;
  entityType?: string | null;
  entityId?: number | null;
  details?: unknown;
  createdAt?: Date;
}

export type InsertAuditLog = Omit<AuditLog, 'id' | 'createdAt'>;

// Extended types used on the frontend
export interface ActivityWithImageUrl {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  maxGroupSize?: number;
  imageUrl?: string;
}

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

// Schemas for booking forms
export const insertActivitySchema = activitySchema.omit({});

export const insertBookingSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  activityId: z.coerce.number(),
  date: z.string().min(1),
  people: z.coerce.number().int().positive(),
  notes: z.string().optional(),
  status: z.string().optional(),
  crmReference: z.string().optional(),
});

export const bookingFormSchema = insertBookingSchema.extend({
  activity: z.string().min(1, 'Please select an activity'),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginData = z.infer<typeof loginSchema>;

// Availability types
export enum AvailabilityStatus {
  AVAILABLE = 'available',
  LIMITED = 'limited',
  UNAVAILABLE = 'unavailable',
}

export interface ActivityAvailability {
  date: string; // ISO format date string (YYYY-MM-DD)
  activityId: number;
  status: AvailabilityStatus;
  spotsRemaining?: number; // Optional field to show how many spots are left
}

export interface DateAvailability {
  date: string;
  status: AvailabilityStatus;
  activitiesStatus: {
    [activityId: number]: AvailabilityStatus;
  };
}

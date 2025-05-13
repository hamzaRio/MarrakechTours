import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertActivitySchema, insertBookingSchema, loginSchema,
  Activity, Booking, User
} from "@shared/schema";
import jwt from "jsonwebtoken";
import session from "express-session";
import MemoryStore from "memorystore";
import path from "path";
import mongoBookingRoutes from './routes/mongoBookingRoutes';
import { isMongoConnected } from './config/database';

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || "marrakech-deserts-secret-key";

// Session middleware
const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session
  app.use(
    session({
      cookie: { maxAge: 86400000 }, // 24 hours
      store: new SessionStore({
        checkPeriod: 86400000 // 24 hours
      }),
      resave: false,
      saveUninitialized: false,
      secret: JWT_SECRET
    })
  );
  
  // Set up static files serving
  const staticPath = path.join(process.cwd(), 'public');
  console.log(`Serving static files from: ${staticPath}`);
  app.use('/static', express.static(staticPath));
  
  // Register MongoDB routes only if MongoDB is connected
  try {
    if (isMongoConnected()) {
      app.use('/api/mongo', mongoBookingRoutes);
      console.log('MongoDB booking routes registered and available at /api/mongo/*');
    } else {
      console.log('MongoDB routes not registered - database not connected');
    }
  } catch (error) {
    console.error('Error while setting up MongoDB routes:', error);
  }

  // Middleware to check authentication
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    // Check for session authentication
    if (req.session && req.session.userId) {
      return next();
    }

    // Check for JWT token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        req.session.userId = decoded.userId;
        return next();
      } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    return res.status(401).json({ message: "Unauthorized" });
  };

  // Middleware to check for superadmin role
  const requireSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden: Requires superadmin privileges" });
    }

    next();
  };

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(validatedData.username);
      
      if (!user || user.password !== validatedData.password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Create session
      req.session.userId = user.id;
      req.session.userRole = user.role;

      // Create JWT token
      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: "24h"
      });
      
      // Create audit log for login
      await storage.createAuditLog({
        userId: user.id,
        action: "LOGIN",
        entityType: "user",
        entityId: user.id,
        details: { username: user.username, timestamp: new Date() }
      });

      // Return user info and token
      return res.json({
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        },
        token
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Activities routes
  app.get("/api/activities", async (req, res) => {
    try {
      const activities = await storage.getAllActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.get("/api/activities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const activity = await storage.getActivity(id);
      
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  app.post("/api/activities", requireAuth, async (req, res) => {
    try {
      const validatedData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(validatedData);
      
      // Create audit log
      if (req.session.userId) {
        await storage.createAuditLog({
          userId: req.session.userId,
          action: "CREATE",
          entityType: "activity",
          entityId: activity.id,
          details: activity
        });
      }
      
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create activity" });
    }
  });

  app.patch("/api/activities/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const oldActivity = await storage.getActivity(id);
      
      if (!oldActivity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      const validatedData = insertActivitySchema.partial().parse(req.body);
      const updatedActivity = await storage.updateActivity(id, validatedData);
      
      // Create audit log
      if (req.session.userId) {
        await storage.createAuditLog({
          userId: req.session.userId,
          action: "UPDATE",
          entityType: "activity",
          entityId: id,
          details: { 
            old: oldActivity, 
            new: updatedActivity 
          }
        });
      }
      
      res.json(updatedActivity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update activity" });
    }
  });

  app.delete("/api/activities/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const activity = await storage.getActivity(id);
      
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      const success = await storage.deleteActivity(id);
      
      // Create audit log
      if (success && req.session.userId) {
        await storage.createAuditLog({
          userId: req.session.userId,
          action: "DELETE",
          entityType: "activity",
          entityId: id,
          details: activity
        });
      }
      
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete activity" });
    }
  });

  // Booking routes
  app.get("/api/bookings", requireAuth, async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBooking(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });
  
  // Endpoint to resend WhatsApp notification for a specific booking
  app.post("/api/bookings/:id/resend-whatsapp", requireAuth, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Get activity name for the booking
      const activity = booking.activityId ? await storage.getActivity(booking.activityId) : null;
      const activityName = booking.selectedActivity || (activity?.title || `Activity #${booking.activityId}`);
      
      // Resend WhatsApp notification
      try {
        const { sendBookingNotification } = await import('./utils/sendWhatsApp');
        const result = await sendBookingNotification({
          fullName: booking.fullName || booking.name,
          phoneNumber: booking.phoneNumber || booking.phone,
          selectedActivity: activityName,
          preferredDate: booking.preferredDate || booking.date,
          numberOfPeople: booking.numberOfPeople || booking.people || 1,
          notes: booking.notes || ''
        });
        
        // Log the resend action as an audit log
        if (req.session.userId) {
          await storage.createAuditLog({
            userId: req.session.userId,
            action: "RESEND_WHATSAPP",
            entityType: "booking",
            entityId: bookingId,
            details: { success: result.success }
          });
        }
        
        return res.status(200).json({ 
          message: "WhatsApp notification resent", 
          success: result.success,
          results: result.results
        });
      } catch (err) {
        log(`Failed to resend WhatsApp notification: ${err}`, 'express');
        return res.status(500).json({ 
          message: "Failed to resend WhatsApp notification", 
          error: err instanceof Error ? err.message : String(err)
        });
      }
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to process booking resend request", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);
      
      // Send WhatsApp notification to admins
      try {
        const { sendBookingNotification } = await import('./utils/sendWhatsApp');
        
        // Get activity name from ID
        const activity = await storage.getActivity(booking.activityId);
        const activityName = activity?.title || `Activity #${booking.activityId}`;
        
        // Send WhatsApp notification
        await sendBookingNotification({
          fullName: booking.name,
          phoneNumber: booking.phone,
          selectedActivity: activityName,
          preferredDate: booking.date,
          numberOfPeople: booking.people,
          notes: booking.notes
        });
      } catch (notificationError) {
        // Log error but don't fail the booking creation
        console.error('Failed to send WhatsApp notification:', notificationError);
      }
      
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.patch("/api/bookings/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const oldBooking = await storage.getBooking(id);
      
      if (!oldBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const validatedData = insertBookingSchema.partial().parse(req.body);
      const updatedBooking = await storage.updateBooking(id, validatedData);
      
      // Create audit log
      if (req.session.userId) {
        await storage.createAuditLog({
          userId: req.session.userId,
          action: "UPDATE",
          entityType: "booking",
          entityId: id,
          details: { 
            old: oldBooking, 
            new: updatedBooking 
          }
        });
      }
      
      res.json(updatedBooking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  app.delete("/api/bookings/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBooking(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const success = await storage.deleteBooking(id);
      
      // Create audit log
      if (success && req.session.userId) {
        await storage.createAuditLog({
          userId: req.session.userId,
          action: "DELETE",
          entityType: "booking",
          entityId: id,
          details: booking
        });
      }
      
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete booking" });
    }
  });

  // Audit logs route (superadmin only)
  app.get("/api/admin/audit-logs", requireAuth, requireSuperAdmin, async (req, res) => {
    try {
      const logs = await storage.getAuditLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Current user route
  app.get("/api/me", requireAuth, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        role: user.role
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Get all users (only for superadmin)
  app.get("/api/admin/users", requireAuth, requireSuperAdmin, async (req, res) => {
    try {
      // Get all users from storage - this would be implemented in a real storage solution
      // For memory storage, we need to get all users from the map
      const users = Array.from(storage.getUsers().values()).map(user => ({
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt
      }));
      
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Availability routes
  app.get("/api/availability/date/:date", async (req, res) => {
    try {
      const date = req.params.date;
      const availability = await storage.getAvailabilityForDate(date);
      res.json(availability);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });
  
  // WhatsApp notification stats endpoint (admin only)
  app.get("/api/admin/notification-stats", requireAuth, async (req, res) => {
    try {
      const { getNotificationStats } = await import('./utils/notificationStats');
      const stats = getNotificationStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch notification stats",
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  app.get("/api/availability/activity/:id/:monthYear", async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      const monthYear = req.params.monthYear;
      const availability = await storage.getAvailabilityForActivity(activityId, monthYear);
      res.json(availability);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity availability" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

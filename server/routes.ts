import express, {
  type Express,
  Request,
  Response,
  NextFunction,
} from "express";
import rateLimit from "express-rate-limit";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertActivitySchema,
  insertBookingSchema,
  Activity,
  Booking,
  User,
} from "@shared/schema";
import path from "path";
import { log } from "./logger";
import mongoBookingRoutes from "./routes/mongoBookingRoutes";
import mongoActivityRoutes from "./routes/mongoActivityRoutes";
import { isMongoConnected } from "./config/database";
import {
  getActivityCapacity,
  getDateCapacity,
} from "./controllers/capacityController";
import {
  setupAuth,
  requireAuth,
  requireAdmin,
  requireSuperAdmin,
} from "./auth";

const userRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each user to 50 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    const user = req.user as Express.User | undefined;
    return user?.id ? String(user.id) : req.ip || "";
  },
});

const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    const user = req.user as Express.User | undefined;
    return user?.id ? String(user.id) : req.ip || "";
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication (includes session configuration)
  setupAuth(app);

  // Set up static files serving
  const staticPath = path.join(process.cwd(), "public");
  console.log(`Serving static files from: ${staticPath}`);
  app.use("/static", express.static(staticPath));

  // Register MongoDB routes only if MongoDB is connected
  try {
    if (isMongoConnected()) {
      // Register booking routes
      app.use("/api/mongo", userRateLimiter, mongoBookingRoutes);
      console.log(
        "MongoDB booking routes registered and available at /api/mongo/*",
      );

      // Register activity routes
      app.use("/api/mongo", userRateLimiter, mongoActivityRoutes);
      console.log(
        "MongoDB activity routes registered and available at /api/mongo/*",
      );

      // Add MongoDB status endpoint
      app.get("/api/mongo/status", (req, res) => {
        try {
          res.status(200).json({ connected: true });
        } catch (error) {
          console.error(error);
          res.status(500).send("Server error");
        }
      });
    } else {
      console.log("MongoDB routes not registered - database not connected");

      // Add MongoDB status endpoint (not connected)
      app.get("/api/mongo/status", (req, res) => {
        try {
          res.status(503).json({ connected: false });
        } catch (error) {
          console.error(error);
          res.status(500).send("Server error");
        }
      });
    }
  } catch (error) {
    console.error("Error while setting up MongoDB routes:", error);

    // Add MongoDB status endpoint (error)
    app.get("/api/mongo/status", (req, res) => {
      try {
        res.status(500).json({ connected: false, error: String(error) });
      } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
      }
    });
  }

  // CRM integration routes
  app.get(
    "/api/crm/status",
    userRateLimiter,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { getCrmStatus } = require("./utils/crmStatus");
        res.json(getCrmStatus());
        return;
      } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
      }
    },
  );

  app.post(
    "/api/crm/test",
    requireAuth,
    requireAdmin,
    userRateLimiter,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { testCrmConnection } = require("./utils/crmStatus");
        const result = await testCrmConnection();
        res.json(result);
        return;
      } catch (error) {
        res.status(500).json({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Unknown error testing CRM connection",
        });
      }
    },
  );

  // Authentication middleware and helpers come from auth.ts

  // Authentication is handled in auth.ts

  // Activities routes
  app.get(
    "/api/activities",
    userRateLimiter,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const activities = await storage.getAllActivities();
        res.json(activities);
        return;
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch activities" });
        return;
      }
    },
  );

  app.get(
    "/api/activities/:id",
    userRateLimiter,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const id = parseInt(req.params.id);
        const activity = await storage.getActivity(id);

        if (!activity) {
          res.status(404).json({ message: "Activity not found" });
          return;
        }

        res.json(activity);
        return;
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch activity" });
        return;
      }
    },
  );

  app.post(
    "/api/activities",
    requireAuth,
    userRateLimiter,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const validatedData = insertActivitySchema.parse(req.body);
        const activity = await storage.createActivity(validatedData);

        // Create audit log
        if (req.user?.id) {
          await storage.createAuditLog({
            userId: req.user.id,
            action: "CREATE",
            entityType: "activity",
            entityId: activity.id,
            details: activity,
          });
        }

        res.status(201).json(activity);
        return;
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({ message: error.errors });
          return;
        }
        res.status(500).json({ message: "Failed to create activity" });
        return;
      }
    },
  );

  app.patch(
    "/api/activities/:id",
    requireAuth,
    userRateLimiter,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const id = parseInt(req.params.id);
        const oldActivity = await storage.getActivity(id);

        if (!oldActivity) {
          res.status(404).json({ message: "Activity not found" });
          return;
        }

        const validatedData = insertActivitySchema.partial().parse(req.body);
        const updatedActivity = await storage.updateActivity(id, validatedData);

        // Create audit log
        if (req.user?.id) {
          await storage.createAuditLog({
            userId: req.user.id,
            action: "UPDATE",
            entityType: "activity",
            entityId: id,
            details: {
              old: oldActivity,
              new: updatedActivity,
            },
          });
        }

        res.json(updatedActivity);
        return;
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({ message: error.errors });
          return;
        }
        res.status(500).json({ message: "Failed to update activity" });
        return;
      }
    },
  );

  app.delete(
    "/api/activities/:id",
    requireAuth,
    userRateLimiter,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const id = parseInt(req.params.id);
        const activity = await storage.getActivity(id);

        if (!activity) {
          res.status(404).json({ message: "Activity not found" });
          return;
        }

        const success = await storage.deleteActivity(id);

        // Create audit log
        if (success && req.user?.id) {
          await storage.createAuditLog({
            userId: req.user.id,
            action: "DELETE",
            entityType: "activity",
            entityId: id,
            details: activity,
          });
        }

        res.json({ success });
        return;
      } catch (error) {
        res.status(500).json({ message: "Failed to delete activity" });
        return;
      }
    },
  );

  // Booking routes
  app.get(
    "/api/bookings",
    requireAuth,
    userRateLimiter,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const bookings = await storage.getAllBookings();
        res.json(bookings);
        return;
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch bookings" });
        return;
      }
    },
  );

  app.get(
    "/api/bookings/:id",
    requireAuth,
    userRateLimiter,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const id = parseInt(req.params.id);
        const booking = await storage.getBooking(id);

        if (!booking) {
          res.status(404).json({ message: "Booking not found" });
          return;
        }

        res.json(booking);
        return;
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch booking" });
        return;
      }
    },
  );

  // Endpoint to manually sync a booking with CRM
  app.post(
    "/api/bookings/:id/sync-crm",
    requireAuth,
    userRateLimiter,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const bookingId = parseInt(req.params.id);
        const booking = await storage.getBooking(bookingId);

        if (!booking) {
          res.status(404).json({ message: "Booking not found" });
          return;
        }

        // Get activity name for the booking
        const activity = booking.activityId
          ? await storage.getActivity(booking.activityId)
          : null;
        const activityName =
          activity?.title || `Activity #${booking.activityId}`;

        // Sync with CRM
        const { syncBookingWithCrm } = await import("./utils/crmIntegration");
        const crmResult = await syncBookingWithCrm(booking, activityName);

        if (crmResult.success) {
          // Update the booking with the CRM reference ID if available
          if (crmResult.crmId) {
            const updatedBooking = await storage.updateBooking(bookingId, {
              crmReference: crmResult.crmId,
            });

            // Create audit log for CRM sync
            await storage.createAuditLog({
              userId: req.user?.id || 0,
              action: "MANUAL_CRM_SYNC",
              entityType: "booking",
              entityId: bookingId,
              details: {
                crmId: crmResult.crmId,
                message: crmResult.message,
              },
            });

            res.json({
              success: true,
              message: crmResult.message,
              booking: updatedBooking || booking,
            });
            return;
          }
        }

        res.json({
          success: crmResult.success,
          message: crmResult.message || "Unknown error during CRM sync",
        });
        return;
      } catch (error) {
        console.error("Error syncing booking with CRM:", error);
        res.status(500).json({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Failed to sync booking with CRM",
        });
        return;
      }
    },
  );

  // Endpoint to resend WhatsApp notification for a specific booking
  app.post(
    "/api/bookings/:id/resend-whatsapp",
    requireAuth,
    userRateLimiter,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const bookingId = parseInt(req.params.id);
        const booking = await storage.getBooking(bookingId);

        if (!booking) {
          res.status(404).json({ message: "Booking not found" });
          return;
        }

        // Get activity name for the booking
        const activity = booking.activityId
          ? await storage.getActivity(booking.activityId)
          : null;
        const activityName =
          "selectedActivity" in booking
            ? (booking as any).selectedActivity
            : activity?.title || `Activity #${booking.activityId}`;

        // Resend WhatsApp notification
        try {
          const { sendBookingNotification } = await import(
            "./utils/sendWhatsApp"
          );
          const result = await sendBookingNotification({
            fullName:
              "fullName" in booking ? (booking as any).fullName : booking.name,
            phoneNumber:
              "phoneNumber" in booking
                ? (booking as any).phoneNumber
                : booking.phone,
            selectedActivity: activityName,
            preferredDate:
              "preferredDate" in booking
                ? String((booking as any).preferredDate)
                : booking.date,
            numberOfPeople:
              "numberOfPeople" in booking
                ? (booking as any).numberOfPeople
                : booking.people || 1,
            notes: booking.notes || "",
          });

          // Log the resend action as an audit log
          if (req.user?.id) {
            await storage.createAuditLog({
              userId: req.user.id,
              action: "RESEND_WHATSAPP",
              entityType: "booking",
              entityId: bookingId,
              details: { success: result.success },
            });
          }

          res.status(200).json({
            message: "WhatsApp notification resent",
            success: result.success,
            results: result.results,
          });
          return;
        } catch (err) {
          log(`Failed to resend WhatsApp notification: ${err}`, "express");
          res.status(500).json({
            message: "Failed to resend WhatsApp notification",
            error: err instanceof Error ? err.message : String(err),
          });
          return;
        }
      } catch (error) {
        res.status(500).json({
          message: "Failed to process booking resend request",
          error: error instanceof Error ? error.message : String(error),
        });
        return;
      }
    },
  );

  app.post(
    "/api/bookings",
    userRateLimiter,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const validatedData = insertBookingSchema.parse(req.body);

      // Check if there's enough capacity for this booking
      const { checkActivityCapacity } = await import("./utils/capacityManager");
      const date = new Date(validatedData.date);
      const capacityCheck = await checkActivityCapacity(
        validatedData.activityId,
        date,
        validatedData.people,
      );

      // If there isn't enough capacity, return an error
      if (!capacityCheck.hasCapacity) {
        res.status(400).json({
          message: "Not enough capacity for this booking",
          details: capacityCheck.message,
          remainingSpots: capacityCheck.remainingSpots || 0,
        });
        return;
      }

      let booking = await storage.createBooking(validatedData);

      // Get activity name from ID
      const activity = await storage.getActivity(booking.activityId);
      const activityName = activity?.title || `Activity #${booking.activityId}`;

      // Send WhatsApp notification to admins
      try {
        const { sendBookingNotification } = await import(
          "./utils/sendWhatsApp"
        );

        await sendBookingNotification({
          fullName: booking.name,
          phoneNumber: booking.phone,
          selectedActivity: activityName,
          preferredDate: booking.date,
          numberOfPeople: booking.people,
          notes: booking.notes || undefined,
        });
      } catch (notificationError) {
        // Log error but don't fail the booking creation
        console.error(
          "Failed to send WhatsApp notification:",
          notificationError,
        );
      }

      // Sync with CRM
      try {
        const { syncBookingWithCrm } = await import("./utils/crmIntegration");
        const crmResult = await syncBookingWithCrm(booking, activityName);

        if (crmResult.success) {
          console.log(`Booking synced with CRM: ${crmResult.message}`);

          // Update the booking with CRM reference ID
          if (crmResult.crmId) {
            const updatedBooking = await storage.updateBooking(booking.id, {
              crmReference: crmResult.crmId,
            });

            if (updatedBooking) {
              booking = updatedBooking; // Update the booking reference for the response
            }

            // Create audit log for CRM sync
            await storage.createAuditLog({
              userId: req.user?.id || 0,
              action: "CRM_SYNC",
              entityType: "booking",
              entityId: booking.id,
              details: {
                crmId: crmResult.crmId,
                message: crmResult.message,
              },
            });
          }
        } else {
          console.warn(`CRM sync failed: ${crmResult.message}`);
        }
      } catch (crmError) {
        // Log error but don't fail the booking creation
        console.error("Failed to sync with CRM:", crmError);
      }

      res.status(201).json(booking);
      return;
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
        return;
      }
      res.status(500).json({ message: "Failed to create booking" });
      return;
    }
    },
  );

  // Update booking status specifically
  app.patch(
    "/api/bookings/:id/status",
    requireAuth,
    userRateLimiter,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const id = parseInt(req.params.id);
        const { status } = req.body;

        // Validate status
        if (
          !status ||
          !["pending", "confirmed", "cancelled"].includes(status)
        ) {
          res.status(400).json({
            message:
              "Invalid status value. Must be one of: pending, confirmed, cancelled",
          });
          return;
        }

        const oldBooking = await storage.getBooking(id);

        if (!oldBooking) {
          res.status(404).json({ message: "Booking not found" });
          return;
        }

        // Only update the status field
        const updatedBooking = await storage.updateBooking(id, { status });

        // Create audit log
        if (req.user?.id) {
          await storage.createAuditLog({
            userId: req.user.id,
            action: "UPDATE_STATUS",
            entityType: "booking",
            entityId: id,
            details: {
              old: { status: oldBooking.status },
              new: { status },
            },
          });
        }

        res.json({
          success: true,
          message: `Booking status updated to ${status}`,
          booking: updatedBooking,
        });
        return;
      } catch (error) {
        console.error("Error updating booking status:", error);
        res.status(500).json({ message: "Failed to update booking status" });
        return;
      }
    },
  );

  app.patch(
    "/api/bookings/:id",
    requireAuth,
    userRateLimiter,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const id = parseInt(req.params.id);
        const oldBooking = await storage.getBooking(id);

        if (!oldBooking) {
          res.status(404).json({ message: "Booking not found" });
          return;
        }

        const validatedData = insertBookingSchema.partial().parse(req.body);
        const updatedBooking = await storage.updateBooking(id, validatedData);

        // Create audit log
        if (req.user?.id) {
          await storage.createAuditLog({
            userId: req.user.id,
            action: "UPDATE",
            entityType: "booking",
            entityId: id,
            details: {
              old: oldBooking,
              new: updatedBooking,
            },
          });
        }

        res.json(updatedBooking);
        return;
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({ message: error.errors });
          return;
        }
        res.status(500).json({ message: "Failed to update booking" });
        return;
      }
    },
  );

  app.delete(
    "/api/bookings/:id",
    requireAuth,
    userRateLimiter,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const id = parseInt(req.params.id);
        const booking = await storage.getBooking(id);

        if (!booking) {
          res.status(404).json({ message: "Booking not found" });
          return;
        }

        const success = await storage.deleteBooking(id);

        // Create audit log
        if (success && req.user?.id) {
          await storage.createAuditLog({
            userId: req.user.id,
            action: "DELETE",
            entityType: "booking",
            entityId: id,
            details: booking,
          });
        }

        res.json({ success });
        return;
      } catch (error) {
        res.status(500).json({ message: "Failed to delete booking" });
        return;
      }
    },
  );

  // Audit logs route (superadmin only)
  const auditLogsRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each superadmin to 50 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request): string => {
      const user = req.user as Express.User | undefined;
      return user?.id ? String(user.id) : req.ip || "";
    },
  });

  app.get(
    "/api/admin/audit-logs",
    requireAuth,
    requireSuperAdmin,
    adminRateLimiter,
    auditLogsRateLimiter,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const logs = await storage.getAuditLogs();
        res.json(logs);
        return;
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch audit logs" });
        return;
      }
    },
  );

  // Current user route
  app.get(
    "/api/me",
    requireAuth,
    userRateLimiter,
    async (req: Request, res: Response): Promise<void> => {
      try {
        if (!req.user?.id) {
          res.status(401).json({ message: "Not authenticated" });
          return;
        }

      const user = await storage.getUser(req.user.id);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
      });
      return;
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
      return;
    }
    },
  );

  // Get all users (only for superadmin)
  app.get(
    "/api/admin/users",
    requireAuth,
    requireSuperAdmin,
    adminRateLimiter,
    async (req: Request, res: Response): Promise<void> => {
      try {
        // Get all users from storage - this would be implemented in a real storage solution
        // For memory storage, we need to get all users from the map
        const users = Array.from(storage.getUsers().values()).map((user) => ({
          id: user.id,
          username: user.username,
          role: user.role,
          createdAt: user.createdAt,
        }));

        res.json(users);
        return;
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch users" });
        return;
      }
    },
  );

  // Availability routes
  app.get(
    "/api/availability/date/:date",
    userRateLimiter,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const date = req.params.date;
        const availability = await storage.getAvailabilityForDate(date);
        res.json(availability);
        return;
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch availability" });
        return;
      }
    },
  );

  // WhatsApp notification stats endpoint (admin only)
  app.get(
    "/api/admin/notification-stats",
    requireAuth,
    requireAdmin,
    adminRateLimiter,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { getNotificationStats } = await import(
          "./utils/notificationStats"
        );
        const stats = getNotificationStats();
        res.json(stats);
        return;
      } catch (error) {
        res.status(500).json({
          message: "Failed to fetch notification stats",
          error: error instanceof Error ? error.message : String(error),
        });
        return;
      }
    },
  );

  app.get(
    "/api/availability/activity/:id/:monthYear",
    userRateLimiter,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const activityId = parseInt(req.params.id);
        const monthYear = req.params.monthYear;
        const availability = await storage.getAvailabilityForActivity(
          activityId,
          monthYear,
        );
        res.json(availability);
        return;
      } catch (error) {
        res
          .status(500)
          .json({ message: "Failed to fetch activity availability" });
        return;
      }
    },
  );

  // Capacity management routes
  app.get(
    "/api/capacity/activity/:activityId/:date",
    userRateLimiter,
    getActivityCapacity,
  );
  app.get("/api/capacity/date/:date", userRateLimiter, getDateCapacity);

  const httpServer = createServer(app);
  return httpServer;
}

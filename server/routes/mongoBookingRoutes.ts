import express from "express";
import rateLimit from "express-rate-limit";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} from "../controllers/bookingController";
import { requireAuth, requireAdmin } from "../auth";

const userRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.user?.id ? String(req.user.id) : req.ip || ""),
});

const router = express.Router();

// Public route to create a booking
router.post("/bookings", userRateLimiter, createBooking);

// Admin-only routes (these will be protected by requireAuth middleware when imported in main routes)
router.get(
  "/bookings",
  requireAuth,
  requireAdmin,
  userRateLimiter,
  getAllBookings,
);
router.get(
  "/bookings/:id",
  requireAuth,
  requireAdmin,
  userRateLimiter,
  getBookingById,
);
router.put(
  "/bookings/:id",
  requireAuth,
  requireAdmin,
  userRateLimiter,
  updateBooking,
);
router.delete(
  "/bookings/:id",
  requireAuth,
  requireAdmin,
  userRateLimiter,
  deleteBooking,
);

export default router;

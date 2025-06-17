import express, { Request, Response } from "express";
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
router.post(
  "/bookings",
  userRateLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      await createBooking(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// Admin-only routes (these will be protected by requireAuth middleware when imported in main routes)
router.get(
  "/bookings",
  requireAuth,
  requireAdmin,
  userRateLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      await getAllBookings(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);
router.get(
  "/bookings/:id",
  requireAuth,
  requireAdmin,
  userRateLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      await getBookingById(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);
router.put(
  "/bookings/:id",
  requireAuth,
  requireAdmin,
  userRateLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      await updateBooking(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);
router.delete(
  "/bookings/:id",
  requireAuth,
  requireAdmin,
  userRateLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      await deleteBooking(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

export default router;

import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import {
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityAnalytics,
} from "../controllers/activityController";
import { requireAuth, requireAdmin } from "../auth";

const userRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.user?.id ? String(req.user.id) : req.ip || ""),
});

const router = express.Router();

// Activity routes
router.get(
  "/activities",
  userRateLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      await getAllActivities(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);
router.get(
  "/activities/:id",
  userRateLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      await getActivityById(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);
router.post(
  "/activities",
  requireAuth,
  requireAdmin,
  userRateLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      await createActivity(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);
router.patch(
  "/activities/:id",
  requireAuth,
  requireAdmin,
  userRateLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      await updateActivity(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);
router.delete(
  "/activities/:id",
  requireAuth,
  requireAdmin,
  userRateLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      await deleteActivity(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);
router.get(
  "/activities/analytics",
  requireAuth,
  requireAdmin,
  userRateLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      await getActivityAnalytics(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

export default router;

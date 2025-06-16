import express from "express";
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
router.get("/activities", userRateLimiter, getAllActivities);
router.get("/activities/:id", userRateLimiter, getActivityById);
router.post(
  "/activities",
  requireAuth,
  requireAdmin,
  userRateLimiter,
  createActivity,
);
router.patch(
  "/activities/:id",
  requireAuth,
  requireAdmin,
  userRateLimiter,
  updateActivity,
);
router.delete(
  "/activities/:id",
  requireAuth,
  requireAdmin,
  userRateLimiter,
  deleteActivity,
);
router.get(
  "/activities/analytics",
  requireAuth,
  requireAdmin,
  userRateLimiter,
  getActivityAnalytics,
);

export default router;

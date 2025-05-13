import express from 'express';
import {
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityAnalytics
} from '../controllers/activityController';

const router = express.Router();

// Activity routes
router.get('/activities', getAllActivities);
router.get('/activities/:id', getActivityById);
router.post('/activities', createActivity);
router.patch('/activities/:id', updateActivity);
router.delete('/activities/:id', deleteActivity);
router.get('/activities/analytics', getActivityAnalytics);

export default router;
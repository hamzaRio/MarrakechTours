import { Request, Response } from 'express';
import { z } from 'zod';
import Activity, { IActivity } from '../models/Activity';
import { isMongoConnected } from '../config/database';
import { activitySchema, ActivityFormData } from '@shared/schema';

type ActivityData = ActivityFormData;

// Get all activities
export const getAllActivities = async (_req: Request, res: Response) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ 
        message: 'MongoDB is not connected. Activities cannot be retrieved.' 
      });
    }

    const activities = await Activity.find().sort({ createdAt: -1 });
    return res.status(200).json(activities);
  } catch (error) {
    console.error('Error getting activities:', error);
    return res.status(500).json({ 
      message: 'Failed to retrieve activities',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get activity by ID
export const getActivityById = async (req: Request, res: Response) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ 
        message: 'MongoDB is not connected. Activity cannot be retrieved.' 
      });
    }

    const { id } = req.params;
    const activity = await Activity.findById(id);
    
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    
    return res.status(200).json(activity);
  } catch (error) {
    console.error('Error getting activity:', error);
    return res.status(500).json({ 
      message: 'Failed to retrieve activity', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create new activity
export const createActivity = async (req: Request, res: Response) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ 
        message: 'MongoDB is not connected. Activity cannot be created.' 
      });
    }

    // Validate request body
    const validatedData = activitySchema.parse(req.body);
    
    // Add createdBy field from authenticated user
    const createdBy = req.session.username || 'admin';
    
    // Create activity
    const activity = await Activity.create({
      ...validatedData,
      createdBy
    });
    
    return res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    return res.status(500).json({ 
      message: 'Failed to create activity', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update activity
export const updateActivity = async (req: Request, res: Response) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ 
        message: 'MongoDB is not connected. Activity cannot be updated.' 
      });
    }

    const { id } = req.params;
    
    // Validate request body
    const validatedData = activitySchema.parse(req.body);
    
    // Find and update the activity
    const updatedActivity = await Activity.findByIdAndUpdate(
      id,
      validatedData,
      { new: true, runValidators: true }
    );
    
    if (!updatedActivity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    
    return res.status(200).json(updatedActivity);
  } catch (error) {
    console.error('Error updating activity:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    return res.status(500).json({ 
      message: 'Failed to update activity', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete activity
export const deleteActivity = async (req: Request, res: Response) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ 
        message: 'MongoDB is not connected. Activity cannot be deleted.' 
      });
    }

    const { id } = req.params;
    const deletedActivity = await Activity.findByIdAndDelete(id);
    
    if (!deletedActivity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    
    return res.status(200).json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return res.status(500).json({ 
      message: 'Failed to delete activity', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get activity analytics (for dashboard)
export const getActivityAnalytics = async (_req: Request, res: Response) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ 
        message: 'MongoDB is not connected. Analytics cannot be retrieved.' 
      });
    }

    // Get total count
    const totalCount = await Activity.countDocuments();
    
    // Get activities by price range
    const priceRanges = [
      { range: '0-500', count: await Activity.countDocuments({ price: { $gte: 0, $lte: 500 } }) },
      { range: '501-1000', count: await Activity.countDocuments({ price: { $gt: 500, $lte: 1000 } }) },
      { range: '1001-2000', count: await Activity.countDocuments({ price: { $gt: 1000, $lte: 2000 } }) },
      { range: '2000+', count: await Activity.countDocuments({ price: { $gt: 2000 } }) }
    ];
    
    // Get most recent activities
    const recentActivities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title price createdAt');
    
    return res.status(200).json({
      totalCount,
      priceRanges,
      recentActivities
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    return res.status(500).json({ 
      message: 'Failed to retrieve analytics', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
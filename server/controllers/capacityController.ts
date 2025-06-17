import { Request, Response } from 'express';
import { checkActivityCapacity, getRemainingCapacity } from '../utils/capacityManager';

/**
 * Get the capacity information for an activity on a specific date
 */
export const getActivityCapacity = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { activityId, date } = req.params;
    
    if (!activityId || !date) {
      res.status(400).json({
        message: "Activity ID and date are required",
      });
      return;
    }
    
    // Parse the date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      res.status(400).json({
        message: "Invalid date format",
      });
      return;
    }
    
    // Get capacity information
    const capacityInfo = await checkActivityCapacity(activityId, parsedDate, 1);
    
    res.json({
      activityId,
      date,
      hasCapacity: capacityInfo.hasCapacity,
      remainingSpots: capacityInfo.remainingSpots,
      maxGroupSize: capacityInfo.maxGroupSize
    });
    return;
  } catch (error) {
    console.error('Error fetching capacity information:', error);
    res.status(500).json({ message: 'Failed to fetch capacity information' });
    return;
  }
};

/**
 * Get the capacity information for multiple activities on a specific date
 */
export const getDateCapacity = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { date } = req.params;
    const { activityIds } = req.query;
    
    if (!date) {
      res.status(400).json({
        message: "Date is required",
      });
      return;
    }
    
    // Parse the date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      res.status(400).json({
        message: "Invalid date format",
      });
      return;
    }
    
    // Handle getting capacity for specific activities or all activities
    let idsToCheck: string[] = [];
    if (activityIds && typeof activityIds === 'string') {
      idsToCheck = activityIds.split(',');
    }
    
    // Get capacity information for each activity
    const capacityPromises = idsToCheck.map(async (id) => {
      const capacityInfo = await checkActivityCapacity(id, parsedDate, 1);
      return {
        activityId: id,
        date,
        hasCapacity: capacityInfo.hasCapacity,
        remainingSpots: capacityInfo.remainingSpots,
        maxGroupSize: capacityInfo.maxGroupSize
      };
    });
    
    const capacityResults = await Promise.all(capacityPromises);
    
    res.json(capacityResults);
    return;
  } catch (error) {
    console.error('Error fetching capacity information:', error);
    res.status(500).json({ message: 'Failed to fetch capacity information' });
    return;
  }
};
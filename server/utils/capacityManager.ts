import { storage } from '../storage';
import Booking from '../models/Booking';
import Activity from '../models/Activity';
import { isMongoConnected } from '../config/database';

/**
 * Check if an activity has enough capacity for a booking on a specific date
 * 
 * @param activityId - The ID of the activity to check
 * @param date - The date to check capacity for
 * @param numberOfPeople - The number of people in the booking
 * @returns Object containing capacity check result
 */
export const checkActivityCapacity = async (
  activityId: number | string, 
  date: Date, 
  numberOfPeople: number
): Promise<{ 
  hasCapacity: boolean; 
  remainingSpots?: number; 
  maxGroupSize?: number; 
  message?: string 
}> => {
  try {
    // Get the activity details
    let activity;
    let maxGroupSize = 0;
    
    // Check if we're using MongoDB or memory storage
    if (isMongoConnected()) {
      activity = await Activity.findById(activityId);
      maxGroupSize = activity?.maxGroupSize || 0;
    } else {
      activity = await storage.getActivity(Number(activityId));
      maxGroupSize = activity?.maxGroupSize || 0;
    }
    
    // If activity doesn't exist or has no maxGroupSize set
    if (!activity) {
      return { 
        hasCapacity: false, 
        message: "Activity not found" 
      };
    }
    
    if (!maxGroupSize) {
      // If no maximum group size is set, assume unlimited capacity
      return { 
        hasCapacity: true, 
        maxGroupSize: 0, 
        message: "No capacity limit set for this activity" 
      };
    }
    
    // Calculate total booked spots for this activity on this date
    let currentBookings = 0;
    
    // Format the date to match the date part only (YYYY-MM-DD)
    const dateString = date.toISOString().split('T')[0];
    
    if (isMongoConnected()) {
      // Get all bookings for this activity on this date from MongoDB
      const startOfDay = new Date(dateString);
      const endOfDay = new Date(dateString);
      endOfDay.setHours(23, 59, 59, 999);
      
      const bookings = await Booking.find({
        selectedActivity: activityId,
        preferredDate: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      });
      
      // Calculate total people booked
      currentBookings = bookings.reduce((total, booking) => total + booking.numberOfPeople, 0);
    } else {
      // Get all bookings from memory storage
      const allBookings = await storage.getAllBookings();
      
      // Filter bookings for this activity on this date
        const bookingsForActivityOnDate = allBookings.filter(booking => {
          // Handle difference between MongoDB and storage models
          const b: any = booking;
          const bookingDate = booking.date ||
            (b.preferredDate instanceof Date ?
             b.preferredDate.toISOString().split('T')[0] :
             String(b.preferredDate));

          const bookingActivityId = booking.activityId ||
            (typeof b.selectedActivity === 'string' ?
             b.selectedActivity :
             String(b.selectedActivity));
        
        return bookingActivityId === activityId.toString() && bookingDate === dateString;
      });
      
      // Calculate total people booked
      currentBookings = bookingsForActivityOnDate.reduce(
        (total, booking) => {
          const b: any = booking;
          const people = booking.people || b.numberOfPeople || 1;
          return total + people;
        },
        0
      );
    }
    
    // Calculate remaining spots
    const remainingSpots = maxGroupSize - currentBookings;
    
    // Check if enough spots remain
    if (remainingSpots >= numberOfPeople) {
      return {
        hasCapacity: true,
        remainingSpots,
        maxGroupSize,
        message: `Sufficient capacity available (${remainingSpots} spots remaining)`
      };
    } else {
      return {
        hasCapacity: false,
        remainingSpots,
        maxGroupSize,
        message: `Insufficient capacity (only ${remainingSpots} spots remaining)`
      };
    }
    
  } catch (error) {
    console.error("Error checking activity capacity:", error);
    return {
      hasCapacity: false,
      message: "Error checking capacity"
    };
  }
};

/**
 * Get the remaining capacity for an activity on a specific date
 * 
 * @param activityId - The ID of the activity
 * @param date - The date to check
 * @returns The number of remaining spots or null if no capacity limit
 */
export const getRemainingCapacity = async (
  activityId: number | string, 
  date: Date
): Promise<number | null> => {
  const result = await checkActivityCapacity(activityId, date, 1);
  
  if (result.maxGroupSize === 0) {
    return null; // No capacity limit
  }
  
  return result.remainingSpots || 0;
};
import { Request, Response } from 'express';
import Booking, { IBooking } from '../models/Booking';
import { z } from 'zod';
import { syncBookingWithCrm } from '../utils/crmIntegration';
import { checkActivityCapacity } from '../utils/capacityManager';

// Zod schema for validating booking data
const bookingSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  phoneNumber: z.string().min(7, "Phone number must be at least 7 characters"),
  selectedActivity: z.string().min(1, "Activity must be selected"),
  preferredDate: z.string().transform((str) => new Date(str)),
  numberOfPeople: z.number().int().positive().default(1),
  notes: z.string().optional()
});

type BookingData = z.infer<typeof bookingSchema>;

// Controller methods
export const createBooking = async (req: Request, res: Response) => {
  try {
    // Validate the request body
    const validatedData = bookingSchema.parse(req.body);
    
    // Check if there's enough capacity for this booking
    const capacityCheck = await checkActivityCapacity(
      validatedData.selectedActivity,
      validatedData.preferredDate,
      validatedData.numberOfPeople
    );
    
    // If there isn't enough capacity, return an error
    if (!capacityCheck.hasCapacity) {
      return res.status(400).json({ 
        message: "Not enough capacity for this booking", 
        details: capacityCheck.message,
        remainingSpots: capacityCheck.remainingSpots || 0
      });
    }
    
    // Create a new booking document
    const newBooking = new Booking({
      fullName: validatedData.fullName,
      phoneNumber: validatedData.phoneNumber,
      selectedActivity: validatedData.selectedActivity,
      preferredDate: validatedData.preferredDate,
      numberOfPeople: validatedData.numberOfPeople,
      notes: validatedData.notes
    });
    
    // Save to database
    const savedBooking = await newBooking.save();
    
    // Send WhatsApp notification to admins
    try {
      const { sendBookingNotification } = await import('../utils/sendWhatsApp');
      
      // Send WhatsApp notification
      await sendBookingNotification({
        fullName: validatedData.fullName,
        phoneNumber: validatedData.phoneNumber,
        selectedActivity: validatedData.selectedActivity,
        preferredDate: validatedData.preferredDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
        numberOfPeople: validatedData.numberOfPeople,
        notes: validatedData.notes
      });
    } catch (notificationError) {
      // Log error but don't fail the booking creation
      console.error('Failed to send WhatsApp notification:', notificationError);
    }
    
    // Sync with CRM
    try {
      // Adapt the MongoDB document to the format expected by the CRM integration
      const bookingForCrm = {
        id: String(savedBooking._id),
        name: savedBooking.fullName,
        phone: savedBooking.phoneNumber,
        date: savedBooking.preferredDate.toISOString().split('T')[0],
        people: savedBooking.numberOfPeople,
        notes: savedBooking.notes || null
      };
      
      // Sync booking with CRM
      const crmResult = await syncBookingWithCrm(
        bookingForCrm as any,
        validatedData.selectedActivity
      );
      
      if (crmResult.success) {
        console.log(`MongoDB booking synced with CRM: ${crmResult.message}`);
        
        // Update the booking with CRM ID if available
        if (crmResult.crmId) {
          savedBooking.crmReference = crmResult.crmId;
          await savedBooking.save();
        }
      } else {
        console.warn(`CRM sync failed for MongoDB booking: ${crmResult.message}`);
      }
    } catch (crmError) {
      // Log error but don't fail the booking creation
      console.error('Failed to sync MongoDB booking with CRM:', crmError);
    }
    
    // Return the saved booking
    res.status(201).json(savedBooking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors });
    }
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Failed to create booking' });
  }
};

export const getAllBookings = async (_req: Request, res: Response) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Failed to fetch booking' });
  }
};

export const updateBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const validatedData = bookingSchema.partial().parse(req.body);
    
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      validatedData,
      { new: true, runValidators: true }
    );
    
    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(updatedBooking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors });
    }
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Failed to update booking' });
  }
};

// Update booking status
export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;
    
    // Validate status value
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status value. Must be one of: pending, confirmed, cancelled' 
      });
    }
    
    // Update the booking status
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // If using in-memory storage as fallback, also update there
    try {
      const { storage } = await import('../storage');
      const numericId = parseInt(bookingId);
      if (!isNaN(numericId)) {
        await storage.updateBooking(numericId, { status });
      }
    } catch (storageError) {
      console.warn('Failed to update status in memory storage:', storageError);
    }
    
    res.json({ 
      success: true, 
      message: `Booking status updated to ${status}`, 
      booking: updatedBooking 
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Failed to update booking status' });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const deletedBooking = await Booking.findByIdAndDelete(bookingId);
    
    if (!deletedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Failed to delete booking' });
  }
};
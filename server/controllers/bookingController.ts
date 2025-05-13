import { Request, Response } from 'express';
import Booking, { IBooking } from '../models/Booking';
import { z } from 'zod';

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
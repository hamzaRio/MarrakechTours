import express from 'express';
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking
} from '../controllers/bookingController';

const router = express.Router();

// Public route to create a booking
router.post('/bookings', createBooking);

// Admin-only routes (these will be protected by requireAuth middleware when imported in main routes)
router.get('/bookings', getAllBookings);
router.get('/bookings/:id', getBookingById);
router.put('/bookings/:id', updateBooking);
router.delete('/bookings/:id', deleteBooking);

export default router;
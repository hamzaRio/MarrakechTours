import mongoose, { Schema, Document } from 'mongoose';

// Define the Booking interface
export interface IBooking extends Document {
  fullName: string;
  phoneNumber: string;
  selectedActivity: string;
  preferredDate: Date;
  numberOfPeople: number;
  notes?: string;
  createdAt: Date;
}

// Create the Booking schema
const BookingSchema: Schema = new Schema({
  fullName: { 
    type: String, 
    required: true 
  },
  phoneNumber: { 
    type: String, 
    required: true 
  },
  selectedActivity: { 
    type: String, 
    required: true 
  },
  preferredDate: { 
    type: Date, 
    required: true 
  },
  numberOfPeople: { 
    type: Number, 
    required: true, 
    default: 1 
  },
  notes: { 
    type: String, 
    required: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Export the model
export default mongoose.model<IBooking>('Booking', BookingSchema);
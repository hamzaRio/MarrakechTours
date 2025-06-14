import mongoose, { Schema, Document } from 'mongoose';

// Define the Booking interface
export interface IBooking extends Document {
  fullName: string;
  phoneNumber: string;
  selectedActivity: string;
  preferredDate: Date;
  numberOfPeople: number;
  notes?: string;
  status: string; // 'pending', 'confirmed', or 'cancelled'
  createdAt: Date;
  crmReference?: string; // Reference ID in the CRM system
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
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  crmReference: { 
    type: String, 
    required: false 
  }
});

// Export the model
export default mongoose.model<IBooking>('Booking', BookingSchema);
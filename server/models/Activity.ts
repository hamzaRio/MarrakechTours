import mongoose, { Document, Schema } from 'mongoose';

// Interface for Activity document
export interface IActivity extends Document {
  title: string;
  description: string;
  price: number;
  image: string;
  durationHours?: number;
  includesFood?: boolean;
  includesTransportation?: boolean;
  maxGroupSize?: number;
  priceType?: 'fixed' | 'per_person';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for Activity collection
const ActivitySchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Activity title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters']
  },
  description: {
    type: String,
    required: [true, 'Activity description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  durationHours: {
    type: Number,
    min: [0, 'Duration cannot be negative']
  },
  includesFood: {
    type: Boolean,
    default: false
  },
  includesTransportation: {
    type: Boolean,
    default: false
  },
  maxGroupSize: {
    type: Number,
    min: [1, 'Group size must be at least 1']
  },
  priceType: {
    type: String,
    enum: ['fixed', 'per_person'],
    default: 'per_person'
  },
  createdBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// Create and export the Activity model
export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
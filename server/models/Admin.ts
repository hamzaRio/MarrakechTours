import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IAdmin extends Document {
  username: string;
  passwordHash: string;
  role: 'superadmin' | 'admin';
  createdAt: Date;
  validatePassword(password: string): Promise<boolean>;
}

const AdminSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['superadmin', 'admin'],
    default: 'admin',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Method to validate password
AdminSchema.methods.validatePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

// Pre-save hook to hash password
AdminSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash as string, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Static method to create admin with hashed password
AdminSchema.statics.createWithHashedPassword = async function(
  username: string,
  password: string,
  role: 'superadmin' | 'admin' = 'admin'
) {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  
  return this.create({
    username,
    passwordHash,
    role
  });
};

export default mongoose.model<IAdmin>('Admin', AdminSchema);
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Admin from '../models/Admin';
import { storage } from '../storage';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';

/**
 * Register a new admin user (MongoDB only)
 */
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body;

    // Check if MongoDB is connected
    if (!mongoose.connection.readyState) {
      return res.status(503).json({ 
        success: false, 
        message: 'MongoDB is not connected. Cannot create admin users at this time.' 
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already exists' 
      });
    }

    // Create new admin
    const admin = await (Admin as any).createWithHashedPassword(username, password, role);
    const adminId = String(admin._id);

    // Generate JWT token
    const token = jwt.sign(
      { id: adminId, username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set user session
    if (req.session) {
      req.session.userId = adminId;
      req.session.username = admin.username;
      req.session.userRole = admin.role;
    }

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      admin: {
        id: adminId,
        username: admin.username,
        role: admin.role,
        createdAt: admin.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to register admin user' 
    });
  }
};

/**
 * Login admin user (MongoDB or memory storage)
 */
export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // First check MongoDB if connected
    if (mongoose.connection.readyState) {
      const admin = await Admin.findOne({ username });
      
      if (admin && await admin.validatePassword(password)) {
        const adminId = String(admin._id);
        // Generate JWT token
        const token = jwt.sign(
          { id: adminId, username: admin.username, role: admin.role },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        // Set user session
        if (req.session) {
          req.session.userId = adminId;
          req.session.username = admin.username;
          req.session.userRole = admin.role;
        }

        return res.json({
          success: true,
          message: 'Login successful',
          admin: {
            id: adminId,
            username: admin.username,
            role: admin.role,
          },
          token
        });
      }
    }

    // If MongoDB authentication failed or not connected, try memory storage
    const users = storage.getUsers();
    
    // Find the user with the given username
    const user = Array.from(users.values()).find(user => user.username === username);
    
    if (user && await bcrypt.compare(password, user.password)) {
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role || 'admin' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Set user session
      if (req.session) {
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.userRole = user.role || 'admin';
      }

      return res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          role: user.role || 'admin',
        },
        token
      });
    }

    res.status(401).json({ 
      success: false, 
      message: 'Invalid username or password' 
    });
  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to login' 
    });
  }
};

/**
 * Get current admin user
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // Check session first
    if (req.session && req.session.userId) {
      // Try to get user from MongoDB if connected
      if (mongoose.connection.readyState) {
        const admin = await Admin.findById(req.session.userId);

        if (admin) {
          const adminId = String(admin._id);
          return res.json({
            id: adminId,
            username: admin.username,
            role: admin.role,
          });
        }
      }
      
      // If MongoDB not connected or user not found, try memory storage
      const user = await storage.getUser(Number(req.session.userId));
      
      if (user) {
        return res.json({
          id: user.id,
          username: user.username,
          role: user.role || 'admin',
        });
      }
    }
    
    // Check JWT token in header if session doesn't exist
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string, username: string, role: string };
        
        // Try to get user from MongoDB if connected
        if (mongoose.connection.readyState) {
          const admin = await Admin.findById(decoded.id);

          if (admin) {
            const adminId = String(admin._id);
            return res.json({
              id: adminId,
              username: admin.username,
              role: admin.role,
            });
          }
        }
        
        // If MongoDB not connected or user not found, try memory storage
        const user = await storage.getUser(Number(decoded.id));
        
        if (user) {
          return res.json({
            id: user.id,
            username: user.username,
            role: user.role || 'admin',
          });
        }
      } catch (error) {
        // Invalid token
      }
    }
    
    res.status(401).json({ message: 'Unauthorized' });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to get current user' 
    });
  }
};

/**
 * Logout admin user
 */
export const logoutAdmin = (req: Request, res: Response) => {
  try {
    // Clear session
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).json({
            success: false,
            message: 'Error logging out'
          });
        }
        
        res.clearCookie('connect.sid');
        res.json({
          success: true,
          message: 'Logged out successfully'
        });
      });
    } else {
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    }
  } catch (error) {
    console.error('Error logging out admin:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to logout' 
    });
  }
};
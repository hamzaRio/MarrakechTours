import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Admin from '../models/Admin';
import { storage } from '../storage';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';

// Extend Express Request type to include user data


/**
 * Middleware to check if user is authenticated
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check session first
    if (req.session && req.session.userId) {
      // Try to get user from MongoDB if connected
      if (mongoose.connection.readyState) {
        const admin = await Admin.findById(req.session.userId);
        
        if (admin) {
          req.user = {
            id: admin._id as any,
            username: admin.username,
            role: admin.role,
            createdAt: admin.createdAt ?? null
          };
          return next();
        }
      }
      
      // If MongoDB not connected or user not found, try memory storage
      const sessionId = typeof req.session.userId === 'string' ? parseInt(req.session.userId, 10) : req.session.userId;
      const user = await storage.getUser(sessionId);
      
      if (user) {
        req.user = {
          id: user.id,
          username: user.username,
          role: user.role || 'admin',
          createdAt: user.createdAt ?? null
        };
        return next();
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
            req.user = {
              id: admin._id as any,
              username: admin.username,
              role: admin.role,
              createdAt: admin.createdAt ?? null
            };
            return next();
          }
        }
        
        // If MongoDB not connected or user not found, try memory storage
          const user = await storage.getUser(Number(decoded.id));
        
        if (user) {
          req.user = {
            id: user.id,
            username: user.username,
            role: user.role || 'admin',
            createdAt: user.createdAt ?? null
          };
          return next();
        }
      } catch (error) {
        // Invalid token
      }
    }
    
    res.status(401).json({ message: 'Authentication required' });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Middleware to check if user is a superadmin
 */
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Superadmin access required' });
  }
  
  next();
};

/**
 * Middleware to check if user is admin (any admin role)
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};
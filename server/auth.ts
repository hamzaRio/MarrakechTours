import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { User } from "@shared/schema";

// Extend Express.User interface with our user properties
declare global {
  namespace Express {
    interface User extends User {}
  }
}

/**
 * Compare a plain text password with a hashed password
 */
async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Setup authentication middleware and routes
 */
export function setupAuth(app: Express) {
  // Configure session - using our storage's sessionStore
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'marrakechdeserts_secret_key',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      // secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  // Initialize session middleware
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        
        const isPasswordValid = await comparePasswords(password, user.password);
        
        if (!isPasswordValid) {
          return done(null, false, { message: "Incorrect password" });
        }
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword as any);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize/deserialize user for session storage
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      done(null, userWithoutPassword as any);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: info?.message || "Authentication failed" 
        });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Create an audit log for the login
        storage.createAuditLog({
          userId: user.id,
          action: "LOGIN",
          entityType: "user",
          entityId: user.id,
          details: { username: user.username }
        });
        
        return res.status(200).json({ 
          success: true, 
          user: {
            id: user.id,
            username: user.username,
            role: user.role
          }
        });
      });
    })(req, res, next);
  });

  app.get("/api/me", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      user: req.user 
    });
  });

  app.post("/api/logout", (req, res) => {
    if (req.user) {
      // Create an audit log for the logout
      storage.createAuditLog({
        userId: (req.user as any).id,
        action: "LOGOUT",
        entityType: "user",
        entityId: (req.user as any).id,
        details: { username: (req.user as any).username }
      });
    }
    
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "Error during logout" 
        });
      }
      
      res.status(200).json({ 
        success: true, 
        message: "Logged out successfully" 
      });
    });
  });
}

/**
 * Middleware to require authentication
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  return res.status(401).json({ 
    success: false, 
    message: "Authentication required" 
  });
}

/**
 * Middleware to require admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required" 
    });
  }
  
  const user = req.user as any;
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    return res.status(403).json({ 
      success: false, 
      message: "Admin privileges required" 
    });
  }
  
  return next();
}

/**
 * Middleware to require superadmin role
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required" 
    });
  }
  
  const user = req.user as any;
  if (user.role !== 'superadmin') {
    return res.status(403).json({ 
      success: false, 
      message: "Superadmin privileges required" 
    });
  }
  
  return next();
}
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { storage } from "./storage";

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'marrakechdeserts_jwt_secret';
const JWT_EXPIRY = '24h'; // Default to 24 hours
const JWT_REMEMBER_ME_EXPIRY = '30d'; // 30 days for "Remember Me"

// Simple token blacklist for invalidated tokens
// In a production environment, this would be stored in Redis or database
const tokenBlacklist = new Set<string>();

// Add token to blacklist
function blacklistToken(token: string) {
  tokenBlacklist.add(token);
}

// Check if token is blacklisted
function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.has(token);
}

// Extend Express.User interface with our user properties
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      role: string;
      createdAt: Date | null;
    }
    
    // Add JWT token to Request
    interface Request {
      token?: string;
    }
  }
}

// Token related interfaces
interface TokenPayload {
  id: number;
  username: string;
  role: string;
  exp?: number;
  iat?: number;
}

interface AuthResponse {
  success: boolean;
  token?: string;
  expiresIn?: string | number;
  user?: {
    id: number;
    username: string;
    role: string;
  };
  message?: string;
}

/**
 * Compare a plain text password with a hashed password
 */
async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Generate a JWT token for a user
 */
function generateToken(user: {id: number, username: string, role: string}, rememberMe: boolean = false): string {
  const payload: TokenPayload = {
    id: user.id,
    username: user.username,
    role: user.role
  };
  
  const expiresIn = rememberMe ? JWT_REMEMBER_ME_EXPIRY : JWT_EXPIRY;
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn
  });
}

/**
 * Verify and decode a JWT token
 */
function verifyToken(token: string): TokenPayload | null {
  // Check if token is blacklisted
  if (isTokenBlacklisted(token)) {
    console.log('Token is blacklisted');
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Extract JWT token from authorization header
 */
function extractToken(req: Request): string | null {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
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
    const { rememberMe } = req.body;
    
    passport.authenticate("local", (err: Error | null, user: any, info: { message?: string } | undefined) => {
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
          details: { 
            username: user.username,
            rememberMe: !!rememberMe,
            usingJwt: true
          }
        });
        
        // Generate JWT token
        const token = generateToken(user, !!rememberMe);
        const expiresIn = rememberMe ? JWT_REMEMBER_ME_EXPIRY : JWT_EXPIRY;
        
        // Store last login date - set to any to bypass type checking temporarily
        storage.updateUser(user.id, { lastLogin: new Date() } as any);
        
        // Return both the session and JWT authentication
        return res.status(200).json({ 
          success: true,
          token,
          expiresIn,
          user: {
            id: user.id,
            username: user.username,
            role: user.role
          }
        });
      });
    })(req, res, next);
  });

  app.get("/api/me", (req, res, next) => {
    // Try JWT authentication first
    const token = extractToken(req);
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        return res.status(200).json({
          success: true,
          user: {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role
          },
          tokenValid: true
        });
      }
    }
    
    // Fall back to session authentication
    if (req.isAuthenticated()) {
      return res.status(200).json({ 
        success: true, 
        user: req.user 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: "Not authenticated" 
    });
  });

  app.post("/api/logout", (req, res) => {
    // Handle JWT token logout
    const token = extractToken(req);
    if (token) {
      // Blacklist the token
      blacklistToken(token);
    }
    
    if (req.user) {
      // Create an audit log for the logout
      storage.createAuditLog({
        userId: (req.user as any).id,
        action: "LOGOUT",
        entityType: "user",
        entityId: (req.user as any).id,
        details: { 
          username: (req.user as any).username,
          usingJwt: !!token
        }
      });
    }
    
    // Handle session logout
    req.logout((err: any) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "Error during logout" 
        });
      }
      
      res.status(200).json({ 
        success: true, 
        message: "Logged out successfully",
        tokenInvalidated: !!token
      });
    });
  });
}

/**
 * Middleware to verify JWT token and set user in request
 */
export function verifyJwtToken(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  
  if (!token) {
    // If no token is provided, continue with session-based auth
    if (req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
  
  // Set the user based on the token payload
  (req as any).user = {
    id: decoded.id,
    username: decoded.username,
    role: decoded.role
  };
  
  (req as any).token = token;
  next();
}

/**
 * Middleware to require authentication (supports both session and JWT)
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  
  // Check JWT token first
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      // Set the user based on the token payload
      (req as any).user = {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role
      };
      (req as any).token = token;
      return next();
    }
  }
  
  // Fall back to session-based auth
  if (req.isAuthenticated()) {
    return next();
  }
  
  return res.status(401).json({ 
    success: false, 
    message: "Authentication required" 
  });
}

/**
 * Middleware to require admin role (supports both session and JWT)
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // First check if authenticated with JWT or session
  requireAuth(req, res, () => {
    // Now we know the user is authenticated one way or another
    const user = req.user as Express.User;
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return res.status(403).json({ 
        success: false, 
        message: "Admin privileges required" 
      });
    }
    
    return next();
  });
}

/**
 * Middleware to require superadmin role (supports both session and JWT)
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  // First check if authenticated with JWT or session
  requireAuth(req, res, () => {
    // Now we know the user is authenticated one way or another
    const user = req.user as Express.User;
    if (user.role !== 'superadmin') {
      return res.status(403).json({ 
        success: false, 
        message: "Superadmin privileges required" 
      });
    }
    
    return next();
  });
}
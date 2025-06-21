import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session, { SessionOptions } from "express-session";
// CSRF protection removed as csurf is deprecated
// import csrf from "csurf";
import type { RequestHandler } from "express";
// Security middleware removed - using alternatives in production
// import lusca from "lusca";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { storage } from "./storage";

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || "change_me";
const JWT_EXPIRY = "24h";
const JWT_REMEMBER_ME_EXPIRY = "30d";
const tokenBlacklist = new Set<string>();

function blacklistToken(token: string) {
  tokenBlacklist.add(token);
}

function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.has(token);
}

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      role: string;
      createdAt: Date | null;
    }
    interface Request {
      token?: string;
    }
  }
}

interface TokenPayload {
  id: number;
  username: string;
  role: string;
  createdAt: Date | null;
  exp?: number;
  iat?: number;
}

function comparePasswords(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

function generateToken(
  user: { id: number; username: string; role: string; createdAt?: Date | null },
  remember = false
): string {
  const payload: TokenPayload = {
    id: user.id,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt ?? null,
  };
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: remember ? JWT_REMEMBER_ME_EXPIRY : JWT_EXPIRY,
  });
}

function verifyToken(token: string): TokenPayload | null {
  if (isTokenBlacklisted(token)) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

function extractToken(req: Request): string | null {
  if (req.headers.authorization?.startsWith("Bearer ")) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
}

export function setupAuth(app: Express) {
  const sessionSettings: SessionOptions = {
    secret: process.env.SESSION_SECRET || "change_me",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      sameSite: "lax",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  };

  app.use(session(sessionSettings));

  // CSRF protection removed as csurf is deprecated
  // Modern alternatives include using SameSite cookies and proper CORS setup
  // app.use(
  //   csrf({
  //     cookie: { httpOnly: false, sameSite: "lax" },
  //   }) as any,
  // );
  // app.use((req: Request, res: Response, next: NextFunction) => {
  //   res.cookie("XSRF-TOKEN", req.csrfToken(), { sameSite: "lax" });
  //   next();
  // });

  app.use(passport.initialize());
  app.use(passport.session());
  // Security headers - using helmet or custom middleware in production
  // app.use(lusca.xframe("SAMEORIGIN"));
  // app.use(lusca.xssProtection(true));

  // CSRF error handling removed with deprecated csurf
  // app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  //   if (err.code === "EBADCSRFTOKEN") {
  //     return res
  //       .status(403)
  //       .json({ success: false, message: "Invalid CSRF token" });
  //   }
  //   next(err);
  // });

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid credentials" });
        }
        const { password: _, ...safeUser } = user;
        done(null, safeUser);
      } catch (err) {
        done(err);
      }
    })
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) return done(null, false);
      const { password: _, ...safeUser } = user;
      done(null, safeUser);
    } catch (err) {
      done(err);
    }
  });

  app.post(
    "/api/login",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { rememberMe } = req.body;
        passport.authenticate(
          "local",
          (err: any, user: Express.User | false, info: any) => {
            if (err) {
              next(err);
              return;
            }
            if (!user) {
              res
                .status(401)
                .json({
                  success: false,
                  message: info?.message || "Login failed",
                });
              return;
            }

            req.login(user, async (err) => {
              if (err) {
                next(err);
                return;
              }
              const token = generateToken(user, rememberMe);
              await storage.updateUser(user.id, { lastLogin: new Date() } as any);
              storage.createAuditLog({
                userId: user.id,
                action: "LOGIN",
                entityType: "user",
                entityId: user.id,
                details: { username: user.username, rememberMe, usingJwt: true },
              });

              res.status(200).json({
                success: true,
                token,
                expiresIn: rememberMe ? JWT_REMEMBER_ME_EXPIRY : JWT_EXPIRY,
                user,
              });
              return;
            });
          },
        )(req, res, next);
      } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
      }
    },
  );

  app.get("/api/me", async (req: Request, res: Response): Promise<void> => {
    try {
      const token = extractToken(req);
      const decoded = token ? verifyToken(token) : null;

      if (decoded) {
        res.json({ success: true, user: decoded, tokenValid: true });
        return;
      }

      if (req.isAuthenticated()) {
        res.json({ success: true, user: req.user });
        return;
      }

      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  });

  app.post("/api/logout", async (req: Request, res: Response): Promise<void> => {
    try {
      const token = extractToken(req);
      if (token) blacklistToken(token);

      if (req.user) {
        await storage.createAuditLog({
          userId: (req.user as any).id,
          action: "LOGOUT",
          entityType: "user",
          entityId: (req.user as any).id,
          details: { username: (req.user as any).username, usingJwt: !!token },
        });
      }

      req.logout((err) => {
        if (err) {
          console.error(err);
          res.status(500).json({ success: false, message: "Logout failed" });
          return;
        }

        res.json({
          success: true,
          message: "Logged out",
          tokenInvalidated: !!token,
        });
        return;
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  });
}

export function verifyJwtToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = extractToken(req);
  const decoded = token ? verifyToken(token) : null;

  if (decoded) {
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      createdAt: decoded.createdAt ?? null,
    };
    if (token) req.token = token;
    return next();
  }

  if (req.isAuthenticated()) return next();
  res.status(401).json({ success: false, message: "Authentication required" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  verifyJwtToken(req, res, next);
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    const user = req.user as Express.User;
    if (user.role === "admin" || user.role === "superadmin") return next();
    res.status(403).json({ success: false, message: "Admin access required" });
  });
}

export function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  requireAuth(req, res, () => {
    const user = req.user as Express.User;
    if (user.role === "superadmin") return next();
    res
      .status(403)
      .json({ success: false, message: "Superadmin access required" });
  });
}

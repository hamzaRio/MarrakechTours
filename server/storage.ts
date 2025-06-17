import { 
  Activity, InsertActivity, 
  Booking, InsertBooking, 
  User, InsertUser, 
  AuditLog, InsertAuditLog, 
  ActivityAvailability, AvailabilityStatus
} from "@shared/schema";
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval, addDays } from "date-fns";
import session from 'express-session';
import createMemoryStore from 'memorystore';
import bcrypt from 'bcrypt';

const MemoryStore = createMemoryStore(session);

// Define the storage interface with all CRUD operations
export interface IStorage {
  // Activity operations
  getAllActivities(): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, activity: Partial<InsertActivity>): Promise<Activity | undefined>;
  deleteActivity(id: number): Promise<boolean>;
  
  // Booking operations
  getAllBookings(): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: number): Promise<boolean>;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  getUsers(): Map<number, User>;
  
  // Audit log operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(): Promise<AuditLog[]>;
  
  // Availability operations
  getAvailabilityForDate(date: string): Promise<ActivityAvailability[]>;
  getAvailabilityForActivity(activityId: number, monthYear: string): Promise<ActivityAvailability[]>;
  
  // Session store
  sessionStore: session.Store;
}

// In-memory implementation of the storage interface
export class MemStorage implements IStorage {
  private activities: Map<number, Activity>;
  private bookings: Map<number, Booking>;
  private users: Map<number, User>;
  private auditLogs: Map<number, AuditLog>;
  
  private activityCurrentId: number;
  private bookingCurrentId: number;
  private userCurrentId: number;
  private auditLogCurrentId: number;
  
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
    this.activities = new Map();
    this.bookings = new Map();
    this.users = new Map();
    this.auditLogs = new Map();
    
    this.activityCurrentId = 1;
    this.bookingCurrentId = 1;
    this.userCurrentId = 1;
    this.auditLogCurrentId = 1;
    
    // Initialize with default activities
    this.initializeActivities();
    // Initialize with default admin users
    this.initialize();
  }

  // Initialize async operations
  private async initialize() {
    await this.initializeUsers();
  }

  private initializeActivities() {
    const defaultActivities: InsertActivity[] = [
      {
        title: "Montgolfière (Hot Air Balloon)",
        description: "Experience the breathtaking views of Marrakech and the Atlas Mountains from a hot air balloon at sunrise. Float peacefully above the stunning Moroccan landscape as the sun begins to illuminate the desert and mountains.",
        price: 1100,
        image: "/attached_assets/montgolfiere-marrakech.jpg",
        featured: true,
        available: false,
        maxGroupSize: 8,
      },
      {
        title: "Agafay Combo",
        description: "Discover the stone desert of Agafay with camel rides, quad biking, and authentic Berber dinner under the stars. Experience the Moroccan desert lifestyle and enjoy breathtaking views of the Atlas mountains.",
        price: 450,
        image: "/attached_assets/agafaypack.jpeg",
        featured: true,
        maxGroupSize: 15,
      },
      {
        title: "Essaouira Day Trip",
        description: "Visit the charming coastal town of Essaouira with its blue-painted seaside buildings, historic medina, and beautiful beaches. Experience the unique atmosphere of this UNESCO World Heritage site.",
        price: 200,
        image: "/attached_assets/Essaouira day trip 4.jpg",
        featured: true,
        maxGroupSize: 20,
      },
      {
        title: "Ouzoud Waterfalls Day Trip",
        description: "Explore the stunning Ouzoud Waterfalls, one of Morocco's most spectacular natural wonders with cascading waterfalls and lush green landscapes. Spot wild Barbary macaque monkeys and enjoy breathtaking viewpoints throughout this scenic day trip.",
        price: 200,
        image: "/attached_assets/Ouzoud-Waterfalls.jpg",
        featured: true,
        maxGroupSize: 16,
      },
      {
        title: "Ourika Valley Day Trip",
        description: "Journey to the beautiful Ourika Valley with its crystal-clear streams, snow-capped Atlas Mountains, and authentic Berber villages. Experience the local culture, enjoy scenic views, and connect with nature in this verdant paradise.",
        price: 150,
        image: "/attached_assets/ourika-valley-marrakech.jpg",
        featured: true,
        maxGroupSize: 24,
      }
    ];

    defaultActivities.forEach(activity => {
      this.createActivity(activity);
    });
  }

  private async initializeUsers() {
    // Hash passwords with bcrypt for security
    const saltRounds = 10;
    
    // Define our default admin users
    const defaultUsers: InsertUser[] = [
      {
        username: "ahmed",
        password: await bcrypt.hash("MarrakechTour2025", saltRounds), 
        role: "admin"
      },
      {
        username: "yahia",
        password: await bcrypt.hash("MarrakechTour2025", saltRounds),
        role: "admin"
      },
      {
        username: "nadia",
        password: await bcrypt.hash("MarrakechTour2025", saltRounds),
        role: "superadmin"
      }
    ];

    // Create each user in the storage
    for (const user of defaultUsers) {
      await this.createUser(user);
    }
  }

  // Activity operations
  async getAllActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityCurrentId++;
    const now = new Date();
    const newActivity: Activity = { 
      ...activity, 
      id,
      featured: activity.featured ?? null,
      available: activity.available ?? true,
      getYourGuidePrice: activity.getYourGuidePrice ?? null,
      createdAt: now,
      updatedAt: now,
      durationHours: activity.durationHours ?? null,
      includesFood: activity.includesFood ?? null,
      includesTransportation: activity.includesTransportation ?? null,
      maxGroupSize: activity.maxGroupSize ?? null,
      priceType: activity.priceType ?? "per_person",
      createdBy: activity.createdBy ?? null
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  async updateActivity(id: number, activityUpdate: Partial<InsertActivity>): Promise<Activity | undefined> {
    const existingActivity = this.activities.get(id);
    if (!existingActivity) return undefined;

    const updatedActivity: Activity = {
      ...existingActivity,
      ...activityUpdate,
      updatedAt: new Date()
    };

    this.activities.set(id, updatedActivity);
    return updatedActivity;
  }

  async deleteActivity(id: number): Promise<boolean> {
    return this.activities.delete(id);
  }

  // Booking operations
  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.bookingCurrentId++;
    const now = new Date();
    const newBooking: Booking = { 
      ...booking, 
      id, 
      status: "pending", // Default status for new bookings
      createdAt: now,
      notes: booking.notes ?? null,
      crmReference: booking.crmReference ?? null
    };
    this.bookings.set(id, newBooking);
    return newBooking;
  }

  async updateBooking(id: number, bookingUpdate: Partial<InsertBooking>): Promise<Booking | undefined> {
    const existingBooking = this.bookings.get(id);
    if (!existingBooking) return undefined;

    const updatedBooking: Booking = {
      ...existingBooking,
      ...bookingUpdate
    };

    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async deleteBooking(id: number): Promise<boolean> {
    return this.bookings.delete(id);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const newUser: User = { 
      ...user, 
      id, 
      createdAt: now,
      lastLogin: null 
    };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;

    const updatedUser: User = {
      ...existingUser,
      ...userData
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  getUsers(): Map<number, User> {
    return this.users;
  }

  // Audit log operations
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const id = this.auditLogCurrentId++;
    const now = new Date();
    const newLog: AuditLog = { 
      ...log, 
      id, 
      createdAt: now,
      entityType: log.entityType ?? null,
      entityId: log.entityId ?? null,
      details: log.details ?? null
    };
    this.auditLogs.set(id, newLog);
    return newLog;
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values());
  }
  
  // Availability methods
  async getAvailabilityForDate(date: string): Promise<ActivityAvailability[]> {
    const activities = await this.getAllActivities();
    const bookings = await this.getAllBookings();
    
    // Get bookings for this date
    const dateBookings = bookings.filter(booking => booking.date === date);
    
    return activities.map(activity => {
      const activityBookings = dateBookings.filter(booking => booking.activityId === activity.id);
      let status = AvailabilityStatus.AVAILABLE;
      
      // Simulate some availability logic
      // This would be more sophisticated in a real implementation
      if (activityBookings.length >= 10) {
        status = AvailabilityStatus.UNAVAILABLE;
      } else if (activityBookings.length >= 5) {
        status = AvailabilityStatus.LIMITED;
      }
      
      return {
        date,
        activityId: activity.id,
        status,
        spotsRemaining: 10 - activityBookings.length
      };
    });
  }
  
  async getAvailabilityForActivity(activityId: number, monthYear: string): Promise<ActivityAvailability[]> {
    // Parse the month year string (format: 'YYYY-MM')
    const parsedDate = parse(monthYear, 'yyyy-MM', new Date());
    
    // Get start and end of month
    const start = startOfMonth(parsedDate);
    const end = endOfMonth(parsedDate);
    
    // Get all days of the month
    const days = eachDayOfInterval({ start, end });
    
    // Get all bookings
    const bookings = await this.getAllBookings();
    
    // Hard-coded dates for demonstration
    const unavailableDays = [2, 5, 10, 15, 20, 25];
    const limitedDays = [3, 7, 12, 18, 24, 28];
    
    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayOfMonth = day.getDate();
      
      // Determine status based on day of month (for demo purposes)
      let status = AvailabilityStatus.AVAILABLE;
      
      if (unavailableDays.includes(dayOfMonth)) {
        status = AvailabilityStatus.UNAVAILABLE;
      } else if (limitedDays.includes(dayOfMonth)) {
        status = AvailabilityStatus.LIMITED;
      }
      
      // Count actual bookings for this activity on this date
      const dayBookings = bookings.filter(
        booking => booking.activityId === activityId && booking.date === dateStr
      );
      
      // Override status based on bookings if needed
      if (dayBookings.length >= 10) {
        status = AvailabilityStatus.UNAVAILABLE;
      } else if (dayBookings.length >= 5 && status === AvailabilityStatus.AVAILABLE) {
        status = AvailabilityStatus.LIMITED;
      }
      
      return {
        date: dateStr,
        activityId,
        status,
        spotsRemaining: status === AvailabilityStatus.UNAVAILABLE ? 0 : 10 - dayBookings.length
      };
    });
  }
}

export const storage = new MemStorage();

import { 
  Activity, InsertActivity, 
  Booking, InsertBooking, 
  User, InsertUser, 
  AuditLog, InsertAuditLog
} from "@shared/schema";

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
  
  // Audit log operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(): Promise<AuditLog[]>;
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

  constructor() {
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
    this.initializeUsers();
  }

  private initializeActivities() {
    const defaultActivities: InsertActivity[] = [
      {
        title: "Montgolfière (Hot Air Balloon)",
        description: "Experience the breathtaking views of Marrakech and the Atlas Mountains from a hot air balloon at sunrise.",
        price: 1100,
        imageUrl: "https://images.unsplash.com/photo-1462651567147-aa679fd1cfaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
        featured: true,
      },
      {
        title: "Agafay Combo",
        description: "Discover the stone desert of Agafay with camel rides, quad biking, and authentic Berber dinner under the stars. Experience the Moroccan desert lifestyle and enjoy breathtaking views of the Atlas mountains.",
        price: 450,
        imageUrl: "/attached_assets/agafaypack.jpeg",
        featured: true,
      },
      {
        title: "Essaouira Day Trip",
        description: "Visit the charming coastal town of Essaouira with its blue-painted seaside buildings and historic medina.",
        price: 200,
        imageUrl: "https://images.unsplash.com/photo-1548774795-d7e0d4e97f32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
        featured: true,
      },
      {
        title: "Ouzoud Waterfalls Day Trip",
        description: "Explore the stunning Ouzoud Waterfalls, one of Morocco's most spectacular natural wonders.",
        price: 200,
        imageUrl: "https://images.unsplash.com/photo-1591283304570-2332b81de041?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
        featured: true,
      },
      {
        title: "Ourika Valley Day Trip",
        description: "Journey to the beautiful Ourika Valley with its waterfalls, mountain views, and authentic Berber villages.",
        price: 150,
        imageUrl: "https://images.unsplash.com/photo-1565689478170-6a026eccad8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
        featured: true,
      }
    ];

    defaultActivities.forEach(activity => {
      this.createActivity(activity);
    });
  }

  private initializeUsers() {
    const defaultUsers: InsertUser[] = [
      {
        username: "ahmed",
        password: "password123", // In a real app, this would be hashed
        role: "admin"
      },
      {
        username: "yahia",
        password: "password123", // In a real app, this would be hashed
        role: "admin"
      },
      {
        username: "nadia",
        password: "password123", // In a real app, this would be hashed
        role: "superadmin"
      }
    ];

    defaultUsers.forEach(user => {
      this.createUser(user);
    });
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
    const newActivity: Activity = { 
      ...activity, 
      id,
      featured: activity.featured ?? null,
      getYourGuidePrice: activity.getYourGuidePrice ?? null
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  async updateActivity(id: number, activityUpdate: Partial<InsertActivity>): Promise<Activity | undefined> {
    const existingActivity = this.activities.get(id);
    if (!existingActivity) return undefined;

    const updatedActivity: Activity = {
      ...existingActivity,
      ...activityUpdate
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
      status: "pending", 
      createdAt: now 
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
    const newUser: User = { ...user, id, createdAt: now };
    this.users.set(id, newUser);
    return newUser;
  }

  // Audit log operations
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const id = this.auditLogCurrentId++;
    const now = new Date();
    const newLog: AuditLog = { ...log, id, timestamp: now };
    this.auditLogs.set(id, newLog);
    return newLog;
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values());
  }
}

export const storage = new MemStorage();

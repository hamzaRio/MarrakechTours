# MarrakechDeserts - Server

This is the backend part of the MarrakechDeserts project, a Moroccan tour booking platform.

## Technology Stack

- Express.js with TypeScript
- MongoDB for database (with in-memory fallback)
- JSON Web Tokens (JWT) for authentication
- Twilio for WhatsApp notifications
- Passport.js for authentication strategies
- Zod for validation
- Drizzle ORM for database operations

## Getting Started

1. Clone the repository
2. Create a `.env` file in the server directory (use `.env.example` as a template)
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Building for Production

To create a production build:

```
npm run build
```

This will generate the compiled server code in the `dist` directory.

## Starting in Production Mode

To start the server in production mode:

```
npm start
```

## Project Structure

- `config/` - Configuration files
  - `database.ts` - MongoDB connection setup
- `controllers/` - Request handlers
  - `activityController.ts` - Activity-related operations
  - `authController.ts` - Authentication-related operations
  - `bookingController.ts` - Booking-related operations
  - `capacityController.ts` - Capacity management operations
- `middleware/` - Express middleware
  - `authMiddleware.ts` - Authentication middleware
- `models/` - MongoDB models
  - `Activity.ts` - Activity schema
  - `Admin.ts` - Admin user schema
  - `Booking.ts` - Booking schema
- `routes/` - API routes
  - `mongoActivityRoutes.ts` - Activity routes for MongoDB
  - `mongoBookingRoutes.ts` - Booking routes for MongoDB
- `utils/` - Utility functions
  - `capacityManager.ts` - Capacity management utilities
  - `crmIntegration.ts` - HubSpot CRM integration
  - `sendWhatsApp.ts` - WhatsApp notification utilities
- `auth.ts` - Authentication setup
- `index.ts` - Main entry point
- `routes.ts` - Route registration
- `storage.ts` - Data storage interfaces and implementations

## Features

- RESTful API for activities and bookings
- Authentication with JWT
- Role-based access control
- WhatsApp notifications for new bookings
- CRM integration with HubSpot
- Capacity management to prevent overbooking
- In-memory storage fallback if MongoDB is unavailable
- Audit logging for activity tracking
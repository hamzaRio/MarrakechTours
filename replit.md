# Marrakech Tours Platform

## Overview

This is a comprehensive Moroccan tour booking platform designed as a full-stack monorepo. The application enables tourists to browse and book authentic Moroccan desert experiences with features like multilingual support, real-time capacity management, WhatsApp notifications, and a robust admin dashboard.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom Moroccan-themed design system
- **UI Components**: Radix UI with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Internationalization**: i18next for English, French, and Arabic support
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM (with in-memory fallback)
- **ORM**: Drizzle ORM configured for PostgreSQL (ready for migration)
- **Authentication**: JWT tokens with session management using Passport.js
- **File Upload**: Multer for handling asset uploads
- **Rate Limiting**: Express rate limiter for API protection
- **CORS**: Configured for cross-origin requests

### Deployment Strategy
- **Frontend**: Vercel with automatic deployments
- **Backend**: Render with auto-scaling capabilities
- **Database**: MongoDB Atlas (with local development fallback)
- **Assets**: Static files served from `/attached_assets` directory

## Key Components

### Authentication System
- JWT-based authentication with refresh tokens
- Role-based access control (admin, superadmin)
- Session fallback for better user experience
- Token blacklisting for secure logout

### Booking Management
- Real-time capacity checking to prevent overbooking
- Multi-language booking forms with validation
- Status tracking (pending, confirmed, cancelled)
- Integration with external CRM systems (HubSpot)

### Notification System
- WhatsApp integration via Twilio API
- Sequential notification system to multiple team members
- Booking confirmation messages
- Admin notification for new bookings

### Admin Dashboard
- Comprehensive booking management interface
- Activity CRUD operations with image management
- Real-time analytics and reporting
- Audit logging for all administrative actions
- CRM synchronization status monitoring

### Capacity Management
- Dynamic availability checking based on group sizes
- Date-specific capacity constraints
- Real-time availability display for customers
- Overbooking prevention mechanisms

## Data Flow

1. **Customer Journey**:
   - Browse activities on multilingual homepage
   - Select activity and view detailed information
   - Check availability using calendar component
   - Submit booking form with validation
   - Receive WhatsApp confirmation

2. **Admin Workflow**:
   - Authenticate via secure login
   - Monitor real-time booking dashboard
   - Manage activity listings and pricing
   - Update booking statuses
   - Review audit logs and analytics

3. **Notification Flow**:
   - New booking triggers WhatsApp messages
   - Sequential delivery to team members (Nadia → Ahmed → Yahia)
   - CRM synchronization for lead management
   - Status updates communicated to customers

## External Dependencies

### Required Services
- **MongoDB Atlas**: Primary database for production
- **Twilio**: WhatsApp Business API for notifications
- **HubSpot**: CRM integration for lead management
- **Vercel**: Frontend hosting and deployment
- **Render**: Backend hosting with auto-scaling

### Optional Services
- **PostgreSQL**: Ready for migration via Drizzle ORM
- **Cloudinary**: Image optimization and CDN
- **SendGrid**: Email notifications backup

### Development Dependencies
- **Vite**: Development server and build tool
- **TypeScript**: Type safety across the stack
- **ESLint/Prettier**: Code quality and formatting
- **Vitest**: Unit and integration testing

## Deployment Strategy

### Frontend Deployment (Vercel)
- Automatic deployments from GitHub
- Environment variables configured via Vercel dashboard
- Custom domain with SSL certificate
- Build command: `cd client && npm run build`
- Output directory: `client/dist`

### Backend Deployment (Render)
- Docker-based deployment with auto-scaling
- Environment variables for database and API keys
- Health check endpoint: `/api/health`
- Build command: `cd server && npm install && npm run build`
- Start command: `cd server && npm start`

### Environment Configuration
- Development: Local MongoDB with in-memory fallback
- Staging: MongoDB Atlas with test Twilio credentials
- Production: Full MongoDB Atlas with live Twilio integration

## Changelog

- June 13, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.
# MarrakechDeserts

A comprehensive Moroccan tour booking platform with multilingual support, real-time capacity management, WhatsApp notifications, and a robust admin dashboard.

## Project Overview

MarrakechDeserts is a full-stack application designed for a local Moroccan travel agency to showcase their tour offerings and allow customers to book experiences. The platform features five main tours (Hot Air Balloon, Essaouira Day Trip, Agafay Desert Camp, Ouzoud Waterfalls, and Ourika Valley) with detailed information, capacity management, and a streamlined booking process.

## Key Features

- **Multilingual Support**: English, French, and Arabic
- **Responsive Design**: Optimized for mobile and desktop
- **Real-time Capacity Management**: Prevents overbooking and shows availability
- **WhatsApp Notifications**: Sequential notifications to team members
- **CRM Integration**: Synchronizes booking data with HubSpot
- **Secure Admin Dashboard**: Role-based access control with analytics
- **Booking Status Tracking**: Complete lifecycle management for bookings

## Project Structure

The project is divided into two main parts:

- **Client**: React frontend with TypeScript, Vite, and multilingual support
- **Server**: Express backend with MongoDB, authentication, and external integrations

See the respective README files in each directory for more details:
- [Client README](./client/README.md)
- [Server README](./server/README.md)

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB (optional, as the system has an in-memory fallback)
- Twilio account for WhatsApp integration
- HubSpot API key for CRM integration

### Installation

1. Clone the repository
2. Set up the server:
   ```
   cd server
   cp .env.example .env
   # Edit .env with your credentials
   npm install
   npm run dev
   ```

3. Set up the client:
   ```
   cd client
   cp .env.example .env
   npm install
   npm run dev
   ```

4. Open your browser to `http://localhost:3000`

## Development

Both client and server have their own build processes and can be developed independently.

## Production Deployment

For production deployment:

1. Build the client:
   ```
   cd client
   npm run build
   ```

2. Build the server:
   ```
   cd server
   npm run build
   ```

3. Start the server:
   ```
   cd server
   npm start
   ```

This will serve the static client files and the API from a single Express server.

## Deploying to Vercel

A serverless handler is provided at `api/[...route].ts` which wraps the Express application for Vercel's Node.js runtime. After running `npm run build` in the `server` directory, deploy the repository root on Vercel and the API will be available under `/api/*`. The client can still be deployed separately from the `client` folder using its own `vercel.json`.

## Credits

Built for a local Moroccan tour agency to showcase their authentic experiences and streamline their booking process

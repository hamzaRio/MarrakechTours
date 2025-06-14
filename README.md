# Marrakech Tours

A comprehensive Moroccan tour booking platform with multilingual support, real-time capacity management, WhatsApp notifications, and a robust admin dashboard.

## 🏗️ Project Architecture

This is a **full-stack monorepo** structured for deployment on:
- **Frontend**: Vercel (React + Vite + TypeScript)
- **Backend**: Render (Express + MongoDB + TypeScript)

### Project Structure
```
├── client/          # Frontend (React + Vite + Tailwind)
├── server/          # Backend (Express + MongoDB + TypeScript)
├── shared/          # Shared types and schemas
├── attached_assets/ # Static images and assets
├── vercel.json      # Frontend deployment config
└── render.yaml      # Backend deployment config
```

## ✨ Key Features

- **Multilingual Support**: English, French, and Arabic
- **Responsive Design**: Optimized for mobile and desktop
- **Real-time Capacity Management**: Prevents overbooking and shows availability
- **WhatsApp Notifications**: Sequential notifications to team members
- **CRM Integration**: Synchronizes booking data with HubSpot
- **Secure Admin Dashboard**: Role-based access control with analytics
- **Booking Status Tracking**: Complete lifecycle management for bookings

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (optional - uses memory storage as fallback)
- Git

### Local Development
```bash
# Clone repository
git clone <your-repo-url>
cd marrakech-tours

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env

# Start development server
npm run dev
```

The app will be available at `http://localhost:5000`

## 📦 Deployment

### Frontend Deployment (Vercel)
1. Connect your GitHub repo to Vercel
2. Set root directory to `client`
3. Configure environment variables:
   - `VITE_API_URL=https://your-backend-url.render.com`
4. Deploy - Vercel will automatically detect Vite configuration

### Backend Deployment (Render)
1. Connect your GitHub repo to Render
2. Create a new Web Service
3. Set build command: `cd server && npm install && npm run build`
4. Set start command: `cd server && npm start`
5. Configure environment variables:
   - `MONGO_URI=your_mongo_connection_string`
   - `JWT_SECRET=your_jwt_secret`
   - `SESSION_SECRET=your_session_secret`
   - `CLIENT_URL=https://your-frontend-url.vercel.app`
   - `NODE_ENV=production`
   - `PORT=5000`

### Required Environment Variables

**Server (.env):**
```env
MONGO_URI=your_mongo_uri_here
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
CLIENT_URL=https://your-frontend-url.vercel.app
NODE_ENV=production
PORT=5000
```

**Client (.env):**
```env
VITE_API_URL=https://your-backend-url.render.com
```

## 🔧 Scripts

**Root level:**
- `npm run dev` - Start development server
- `npm run build` - Build both client and server
- `npm start` - Start production server

**Client:**
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Server:**
- `npm run dev` - Start development server
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

## 📁 Project Structure Details

- **`/client`** - React frontend with Vite, TypeScript, and Tailwind CSS
- **`/server`** - Express backend with MongoDB, authentication, and APIs
- **`/shared`** - Shared TypeScript schemas and types
- **`/attached_assets`** - Static images and tour photos
- **`vercel.json`** - Frontend deployment configuration
- **`render.yaml`** - Backend deployment configuration

## ✅ Ready for GitHub & Deployment

This project is now properly structured for:
- ✅ GitHub repository hosting
- ✅ Vercel frontend deployment
- ✅ Render backend deployment
- ✅ Environment variable management
- ✅ Production-ready builds

## Credits

Built for a local Moroccan tour agency to showcase authentic desert and mountain experiences.

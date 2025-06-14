# Deployment Guide

## Project Structure ✅

This full-stack application is properly structured for deployment:

### Frontend (Vercel)
- **Location**: `/client` directory
- **Framework**: React + Vite + TypeScript + Tailwind CSS
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Configuration**: `client/vercel.json`

### Backend (Render)
- **Location**: `/server` directory  
- **Framework**: Express + TypeScript + MongoDB
- **Build Command**: `cd server && npm install && npm run build`
- **Start Command**: `cd server && npm start`
- **Configuration**: `render.yaml`

### Shared Resources
- **Schemas**: `/shared` directory (TypeScript types and Zod schemas)
- **Assets**: `/attached_assets` directory (tour images and static files)

## Environment Variables ✅

### Server Environment Variables
```env
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
CLIENT_URL=https://your-frontend-url.vercel.app
NODE_ENV=production
PORT=5000

# Optional: Twilio WhatsApp Integration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### Client Environment Variables
```env
VITE_API_URL=https://your-backend-url.render.com
```

## Deployment Steps ✅

### 1. Frontend Deployment (Vercel)
1. Connect GitHub repository to Vercel
2. Set root directory to `client`
3. Configure environment variable: `VITE_API_URL`
4. Deploy automatically

### 2. Backend Deployment (Render)
1. Connect GitHub repository to Render
2. Create new Web Service
3. Configure build and start commands
4. Set all required environment variables
5. Deploy

## Git Configuration ✅

- **`.gitignore`**: Properly excludes `node_modules`, `.env`, `dist`, build artifacts
- **Repository Structure**: Monorepo ready for GitHub hosting
- **No Merge Conflicts**: Clean codebase ready for version control

## Build Scripts ✅

### Root Level
- `npm run dev`: Start development server (port 5000)
- `npm run build`: Build both client and server
- `npm start`: Start production server

### Client (`/client`)
- `npm run dev`: Vite development server (port 3000)
- `npm run build`: Production build
- `npm run preview`: Preview production build

### Server (`/server`)  
- `npm run dev`: Development server with hot reload
- `npm run build`: TypeScript compilation + bundling
- `npm start`: Production server

## Production Ready ✅

✅ **Vercel Frontend Deployment**: Configured for React/Vite hosting
✅ **Render Backend Deployment**: Express server with MongoDB
✅ **Environment Management**: Secure secret handling
✅ **Build Optimization**: Production-ready builds
✅ **CORS Configuration**: Proper cross-origin setup
✅ **Asset Serving**: Static file handling configured
✅ **Database Fallback**: Memory storage when MongoDB unavailable

## Next Steps

1. **Push to GitHub**: Repository is clean and ready
2. **Deploy Frontend**: Connect repository to Vercel, set root to `client`
3. **Deploy Backend**: Connect repository to Render, configure environment variables
4. **Update URLs**: Set production URLs in environment variables
5. **Test Production**: Verify full functionality in deployed environment

The project is now fully structured and ready for deployment on Vercel (frontend) and Render (backend).
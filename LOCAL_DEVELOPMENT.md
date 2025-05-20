# Local Development Guide for MarrakechDeserts

This guide will help you run the MarrakechDeserts project locally on your machine using Visual Studio Code.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [Visual Studio Code](https://code.visualstudio.com/)
- [MongoDB](https://www.mongodb.com/try/download/community) (optional - the app can run with in-memory storage)
- [Git](https://git-scm.com/downloads)

## Recommended VS Code Extensions

When you open this project in VS Code, you'll be prompted to install recommended extensions, including:

- ESLint
- Prettier
- TypeScript
- Tailwind CSS IntelliSense
- DotENV
- MongoDB for VS Code
- Docker

## Project Structure

- `/client` - React frontend with Vite
- `/server` - Express backend with TypeScript
- `/shared` - Shared types and schemas
- `/attached_assets` - Images and assets

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd marrakechdeserts
```

### 2. Environment Variables

Create environment files from the examples:

```bash
# For the server
cd server
cp .env.example .env
# Edit .env with your credentials

# For the client
cd ../client
cp .env.example .env
# Edit .env if needed
```

### 3. Install Dependencies

Install dependencies for both client and server:

```bash
# Server dependencies
cd ../server
npm install

# Client dependencies
cd ../client
npm install
```

### 4. Start Development Servers

Start the backend server:

```bash
# In the server directory
npm run dev
```

In a new terminal, start the frontend:

```bash
# In the client directory
npm run dev
```

- Backend will run on: http://localhost:5000
- Frontend will run on: http://localhost:3000

## Running with VS Code Debugger

You can also use the VS Code debugger to run and debug the application:

1. Open the Debug panel in VS Code (Ctrl+Shift+D or Cmd+Shift+D)
2. Select "Full Stack: Server + Client" from the dropdown
3. Press the green play button

This will start both the server and client with debugging enabled.

## Building for Production

To build both client and server for production:

```bash
# Server build
cd server
npm run build

# Client build
cd ../client
npm run build
```

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Configure the following settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables: Add your `VITE_API_URL` pointing to your deployed backend

### Backend (Railway or Render)

1. Connect your GitHub repository
2. Configure the service:
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Add all the environment variables from your `.env` file

## Troubleshooting

### MongoDB Connection Issues

- Ensure your MongoDB connection string is correct in the server `.env` file
- The app will fall back to in-memory storage if MongoDB is not available

### CORS Issues

- Make sure your `CLIENT_URL` in the server `.env` is set correctly
- For local development, it should be `http://localhost:3000`

### WhatsApp/Twilio Integration

- Verify your Twilio credentials in the server `.env` file
- For testing locally, you may need to use a service like ngrok to expose your local server
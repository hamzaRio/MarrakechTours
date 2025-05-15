# MarrakechDeserts - Client

This is the frontend part of the MarrakechDeserts project, a Moroccan tour booking platform.

## Technology Stack

- React with TypeScript
- Vite as the build tool
- React Query for data fetching
- React Hook Form for form handling
- i18next for multilingual support (English, French, Arabic)
- Tailwind CSS for styling
- shadcn/ui for UI components

## Getting Started

1. Clone the repository
2. Create a `.env` file in the client directory (use `.env.example` as a template)
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

This will generate static files in the `dist/public` directory which can be served by any static file server or the included Express server from the server part of the project.

## Project Structure

- `src/` - Source code
  - `components/` - React components
  - `hooks/` - Custom React hooks
  - `pages/` - Page components
  - `lib/` - Utility functions 
  - `locales/` - Translation files
  - `main.tsx` - Entry point
  - `i18n.ts` - i18next configuration
  - `App.tsx` - Main app component and routing

## Features

- Multilingual support (English, French, Arabic)
- Responsive design for mobile and desktop
- Activity browsing and detailed views
- Booking system with real-time capacity management
- Admin dashboard (when logged in)
- Social sharing functionality
- Interactive calendar and availability display
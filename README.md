# FlexiNet - Full Stack Application

A modern full-stack application with Next.js frontend and Express.js backend, integrated with Supabase.

## Project Structure

```
FlexiNet/
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility functions and API client
│   └── public/       # Static assets
├── server/           # Express.js backend server
│   ├── app.js        # Express server setup
│   ├── supabaseClient.js  # Supabase configuration
│   └── testFunctions.js   # Development test functions
└── package.json      # Root package.json for managing both apps
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

## Setup Instructions

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

#### Backend (.env in server/ directory)
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3001
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env.local in frontend/ directory)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Database Setup

1. Create a `users` table in your Supabase project:
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Development

### Run Both Frontend and Backend
```bash
npm run dev
```

### Run Individually
```bash
# Backend only (runs on http://localhost:3001)
npm run dev:server

# Frontend only (runs on http://localhost:3000)
npm run dev:frontend
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user

## Features

- ✅ CORS-enabled Express server
- ✅ TypeScript API client
- ✅ React hooks for data management
- ✅ User management interface
- ✅ Real-time data synchronization
- ✅ Error handling and loading states

## Tech Stack

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Radix UI components

### Backend
- Express.js
- Supabase
- CORS
- Node.js

## Development Scripts

- `npm run dev` - Run both frontend and backend
- `npm run build` - Build frontend for production
- `npm run start` - Run production build
- `npm run install:all` - Install all dependencies
- `npm run clean` - Clean all node_modules

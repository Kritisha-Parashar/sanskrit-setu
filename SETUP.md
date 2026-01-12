# Setup Guide

## Quick Start

### 1. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=3000
FRONTEND_URL=http://localhost:8080

DB_HOST=localhost
DB_PORT=5432
DB_NAME=sanskrit_setu
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Important:** Make sure PostgreSQL is installed and running. Create the database:

```bash
createdb sanskrit_setu
# Or using psql:
# psql -U postgres
# CREATE DATABASE sanskrit_setu;
```

Start the backend server:

```bash
npm run dev
```

The server will automatically create the necessary tables on startup.

### 2. Frontend Setup

From the root directory:

```bash
npm install
```

(Optional) Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
```

Start the frontend:

```bash
npm run dev
```

## What Changed

### Removed
- ✅ Firebase authentication
- ✅ Firebase configuration files
- ✅ Firebase dependencies from package.json

### Added
- ✅ Express.js backend with TypeScript
- ✅ PostgreSQL database integration
- ✅ JWT-based authentication
- ✅ User registration and login endpoints
- ✅ Password hashing with bcrypt
- ✅ Database schema for users and user_progress

### Updated
- ✅ `src/lib/auth.ts` - Now uses REST API instead of Firebase
- ✅ `src/pages/Login.tsx` - Updated to use new auth system
- ✅ `src/pages/Settings.tsx` - Updated logout to use new auth system

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "Optional Name"
  }
  ```

- `POST /api/auth/login` - Login user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `GET /api/auth/me` - Get current user (requires Authorization header)
  ```
  Authorization: Bearer <token>
  ```

- `POST /api/auth/logout` - Logout (requires Authorization header)

## Database Schema

The application uses two main tables:

1. **users** - Stores user accounts
2. **user_progress** - Stores user learning progress

See `server/src/db/migrations.sql` for the complete schema.

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify the database exists: `psql -U postgres -l`

### CORS Issues
- Make sure `FRONTEND_URL` in server `.env` matches your frontend URL
- Default is `http://localhost:8080`

### Authentication Issues
- Check that the JWT_SECRET is set in server `.env`
- Verify tokens are being stored in localStorage (check browser DevTools)

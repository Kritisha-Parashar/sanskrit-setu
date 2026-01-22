# Complete Database Setup Guide for Sanskrit-Setu

This guide will help you set up the PostgreSQL database for authentication and authorization in the Sanskrit-Setu platform.

## Prerequisites

1. **PostgreSQL installed and running**
   - Download from: https://www.postgresql.org/download/
   - Make sure PostgreSQL service is running

2. **Node.js and npm installed**
   - The project uses Node.js for the backend

## Quick Setup (Recommended)

### Step 1: Create Environment File

Copy the example environment file:

```bash
cd server
cp .env.example .env
```

### Step 2: Update .env File

Edit the `.env` file with your PostgreSQL credentials:

```env
# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:8080

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sanskrit_setu
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here

# JWT Secret (IMPORTANT: Change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this-in-production
```

**Important:** 
- Replace `your_postgres_password_here` with your actual PostgreSQL password
- Generate secure random strings for `JWT_SECRET` and `JWT_REFRESH_SECRET` in production

### Step 3: Run Database Setup Script

```bash
npm run setup-db
```

This script will:
- Create the `sanskrit_setu` database if it doesn't exist
- Create all necessary tables (users, user_progress, refresh_tokens, password_reset_tokens)
- Create indexes for optimal performance
- Set up triggers for automatic timestamp updates

### Step 4: Start the Server

```bash
npm run dev
```

The server will automatically verify the database connection and initialize any missing tables.

## Manual Setup (Alternative)

If you prefer to set up the database manually:

### Step 1: Create Database

Using psql:
```bash
psql -U postgres
```

Then in psql:
```sql
CREATE DATABASE sanskrit_setu;
\q
```

Or using command line:
```bash
createdb sanskrit_setu
# Or with specific user:
createdb -U postgres sanskrit_setu
```

### Step 2: Run Migrations

```bash
psql -U postgres -d sanskrit_setu -f src/db/migrations.sql
```

### Step 3: Verify Setup

```bash
psql -U postgres -d sanskrit_setu -c "\dt"
```

You should see these tables:
- users
- user_progress
- refresh_tokens
- password_reset_tokens

## Database Schema

### Users Table
Stores user authentication information:
- `id` - Primary key (auto-increment)
- `email` - Unique email address
- `password_hash` - Bcrypt hashed password
- `name` - User's display name
- `role` - User role (default: 'student', can be 'teacher' or 'admin')
- `email_verified` - Email verification status
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### User Progress Table
Tracks user learning progress:
- `id` - Primary key
- `user_id` - Foreign key to users table
- `xp` - Experience points
- `completed_lessons` - Array of completed lesson IDs
- `unlocked_lessons` - Array of unlocked lesson IDs
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Refresh Tokens Table
Manages refresh tokens for JWT authentication:
- `id` - Primary key
- `user_id` - Foreign key to users table
- `token` - Refresh token string
- `expires_at` - Token expiration timestamp
- `revoked` - Whether token has been revoked
- `created_at` - Creation timestamp

### Password Reset Tokens Table
Manages password reset tokens:
- `id` - Primary key
- `user_id` - Foreign key to users table
- `token` - Reset token string
- `expires_at` - Token expiration timestamp (1 hour)
- `used` - Whether token has been used
- `created_at` - Creation timestamp

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user (revokes refresh tokens)
- `GET /api/auth/me` - Get current user info (requires auth)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/change-password` - Change password (requires auth)

### Authorization Middleware

The project includes role-based authorization:

```typescript
import { requireAdmin, requireTeacher, authorizeRoles } from '../middleware/auth';

// Require admin role
router.get('/admin-only', authenticateToken, requireAdmin, handler);

// Require teacher or admin
router.get('/teacher-only', authenticateToken, requireTeacher, handler);

// Custom role check
router.get('/custom', authenticateToken, authorizeRoles('custom-role'), handler);
```

## Testing the Setup

### 1. Test Database Connection

Start the server:
```bash
npm run dev
```

You should see:
```
✅ Connected to PostgreSQL database
✅ Database tables initialized successfully
✅ Indexes created
✅ Triggers configured
Server running on port 3000
```

### 2. Test Signup

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### 3. Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 4. Test Protected Route

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### "role does not exist" error
- Create the PostgreSQL user: `createuser -s postgres`
- Or update `DB_USER` in `.env` to an existing user

### "password authentication failed"
- Update `DB_PASSWORD` in `.env` with your correct PostgreSQL password
- Or configure PostgreSQL for peer authentication (local connections)

### "database does not exist"
- Run the setup script: `npm run setup-db`
- Or manually create: `createdb sanskrit_setu`

### "connection refused"
- Make sure PostgreSQL service is running
- Check `DB_HOST` and `DB_PORT` in `.env`

### "relation does not exist"
- Tables weren't created. Run: `npm run setup-db`
- Or manually run migrations: `psql -U postgres -d sanskrit_setu -f src/db/migrations.sql`

## Security Best Practices

1. **Change JWT Secrets**: Never use default secrets in production
2. **Use Strong Passwords**: Enforce password complexity requirements
3. **Enable HTTPS**: Use HTTPS in production
4. **Rate Limiting**: Implement rate limiting for auth endpoints
5. **Email Verification**: Implement email verification for new accounts
6. **Token Expiration**: Use appropriate token expiration times
7. **Password Reset**: Implement secure password reset with email

## Next Steps

1. Set up email service for password reset emails
2. Implement email verification
3. Add rate limiting middleware
4. Set up database backups
5. Configure production environment variables
6. Set up monitoring and logging

## Support

If you encounter issues:
1. Check the server logs for error messages
2. Verify PostgreSQL is running: `pg_isready`
3. Test database connection: `psql -U postgres -d sanskrit_setu`
4. Review the troubleshooting section above

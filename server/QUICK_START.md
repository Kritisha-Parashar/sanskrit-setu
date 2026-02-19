# Quick Start Guide - Database Setup

##Setup (3 Steps)

### 1. Create .env file
```bash
cd server
cp .env.example .env
```

Edit `.env` and update:
- `DB_PASSWORD` - Your PostgreSQL password
- `JWT_SECRET` - A secure random string
- `JWT_REFRESH_SECRET` - Another secure random string

### 2. Run Database Setup
```bash
npm run setup-db
```

This will:
1. Create the database
2. Create all tables
3. Set up indexes
4. Configure triggers

### 3. Start Server
npm run dev

The database is ready for authentication and authorization.

### Database Tables
- **users** - User accounts with authentication
- **user_progress** - Learning progress tracking
- **refresh_tokens** - JWT refresh token management
- **password_reset_tokens** - Password reset functionality

### Authentication Features
1. User registration (signup)
2. User login
3. JWT token generation
4. Refresh token support
5. Password reset
6. Password change
7. Logout with token revocation

### Authorization Features
1. Role-based access control (student, teacher, admin)
2. Middleware for protecting routes
3. Custom role authorization

#Tesing

### Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"Test User"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Get Current User
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#Full Documentation

See `DATABASE_SETUP_COMPLETE.md` for detailed documentation.

##Troubleshooting

**Database connection error?**
- Make sure PostgreSQL is running
- Check your `.env` file credentials

**Tables not created?**
- Run `npm run setup-db` again
- Or manually: `psql -U postgres -d sanskrit_setu -f src/db/migrations.sql`

**Need help?**
- Check `DATABASE_SETUP_COMPLETE.md` for detailed troubleshooting

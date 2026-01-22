# Troubleshooting Guide - Login/Signup Issues

## Common Issues and Solutions

### 1. "Cannot connect to database" or "Database connection failed"

**Symptoms:**
- Server fails to start
- Error: `ECONNREFUSED` or `ENOTFOUND`
- "Failed to initialize database" message

**Solutions:**

1. **Check if PostgreSQL is running:**
   ```bash
   # Windows
   Get-Service postgresql*
   
   # Linux/Mac
   sudo systemctl status postgresql
   ```

2. **Verify database exists:**
   ```bash
   psql -U postgres -l | grep sanskrit_setu
   ```
   
   If it doesn't exist, create it:
   ```bash
   npm run setup-db
   # Or manually:
   createdb sanskrit_setu
   ```

3. **Check .env file:**
   - Make sure `.env` file exists in `server/` directory
   - Verify database credentials are correct:
     ```env
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=sanskrit_setu
     DB_USER=postgres
     DB_PASSWORD=your_password_here
     ```

### 2. "User already exists" on signup

**Solution:**
- This is expected if the email is already registered
- Try logging in instead, or use a different email

### 3. "Invalid email or password" on login

**Possible causes:**
- Wrong email or password
- User doesn't exist (try signing up first)
- Database connection issue

**Solution:**
- Verify the user exists in the database:
  ```sql
  psql -U postgres -d sanskrit_setu -c "SELECT email FROM users;"
  ```
- Try signing up with a new account first

### 4. CORS Errors

**Symptoms:**
- Browser console shows CORS errors
- Requests fail with "Not allowed by CORS"

**Solution:**
- The server is configured to allow `http://localhost:*` origins
- Make sure your frontend is running on `http://localhost` (not `127.0.0.1` or other domains)
- Check the frontend URL in browser address bar

### 5. "Network error: Could not connect to server"

**Symptoms:**
- Frontend can't reach the backend
- 404 or connection refused errors

**Solutions:**

1. **Check if server is running:**
   ```bash
   cd server
   npm run dev
   ```
   
   You should see:
   ```
   ✅ Connected to PostgreSQL database
   ✅ Database connection test successful
   ✅ Database tables initialized successfully
   🚀 Server running on port 3000
   ```

2. **Verify API URL:**
   - Frontend should use: `http://localhost:3000/api`
   - Check `src/lib/auth.ts` - `API_URL` should be correct
   - Or set `VITE_API_URL=http://localhost:3000/api` in root `.env`

3. **Check port conflicts:**
   - Make sure port 3000 is not used by another application
   - Change `PORT` in `server/.env` if needed

### 6. Database Tables Not Created

**Symptoms:**
- Server starts but signup/login fails
- Error: "relation 'users' does not exist"

**Solution:**
```bash
cd server
npm run setup-db
```

Or manually run migrations:
```bash
psql -U postgres -d sanskrit_setu -f src/db/migrations.sql
```

### 7. Authentication Token Issues

**Symptoms:**
- Login works but subsequent requests fail
- "Invalid or expired token" errors

**Solution:**
- Check if token is being sent in Authorization header:
  ```
  Authorization: Bearer <token>
  ```
- Verify token is stored in localStorage after login
- Check browser console for token-related errors

## Debugging Steps

### Step 1: Check Server Logs

Start the server and watch for errors:
```bash
cd server
npm run dev
```

Look for:
- ✅ Database connection messages
- ✅ Table initialization messages
- ❌ Any error messages

### Step 2: Test Database Connection

```bash
psql -U postgres -d sanskrit_setu -c "SELECT COUNT(*) FROM users;"
```

If this works, database is accessible.

### Step 3: Test API Endpoints

**Health check:**
```bash
curl http://localhost:3000/api/health
```

**Signup test:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

**Login test:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Step 4: Check Browser Console

Open browser DevTools (F12) and check:
- Network tab: Are requests being sent? What's the response?
- Console tab: Any JavaScript errors?
- Application tab: Is token stored in localStorage?

### Step 5: Verify Environment Variables

```bash
cd server
# Check if .env exists
ls -la .env

# View .env contents (don't commit this!)
cat .env
```

## Quick Fix Checklist

- [ ] PostgreSQL is running
- [ ] Database `sanskrit_setu` exists
- [ ] `.env` file exists in `server/` directory
- [ ] `.env` has correct database credentials
- [ ] Server starts without errors
- [ ] Frontend can reach `http://localhost:3000/api/health`
- [ ] Browser console shows no CORS errors
- [ ] Database tables exist (users, user_progress, etc.)

## Still Having Issues?

1. **Check server logs** - Look for specific error messages
2. **Check browser console** - Look for network errors
3. **Verify database** - Make sure PostgreSQL is accessible
4. **Test with curl** - Bypass frontend to test backend directly
5. **Check file paths** - Make sure you're in the correct directory

## Getting Help

When asking for help, provide:
1. Server logs (from `npm run dev`)
2. Browser console errors
3. Database connection test results
4. `.env` file structure (without passwords!)
5. PostgreSQL version
6. Node.js version

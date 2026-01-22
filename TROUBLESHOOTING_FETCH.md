# Troubleshooting "Failed to Fetch" Errors

## Quick Checks

1. **Is the server running?**
   ```bash
   cd server
   npm run dev
   ```
   You should see: `Server running on port 5000`

2. **Test the server directly:**
   Open in browser: `http://localhost:5000/api/health`
   Should return: `{"status":"ok"}`

3. **Check browser console:**
   - Open DevTools (F12)
   - Look for CORS errors
   - Look for network errors
   - Check the exact error message

## Common Issues

### Issue 1: Server Not Running
**Symptom:** "Failed to fetch" or "Network error"

**Solution:**
- Make sure the backend server is running on port 5000
- Check terminal for errors
- Verify database connection is working

### Issue 2: Wrong API URL
**Symptom:** 404 errors or connection refused

**Solution:**
- Check `.env` file in root has: `VITE_API_URL=http://localhost:5000/api`
- Or verify the default in `src/lib/auth.ts` is correct
- Frontend should use port 5000, not 8080

### Issue 3: CORS Error
**Symptom:** "CORS policy" error in console

**Solution:**
- Server is configured to allow `http://localhost:*`
- Make sure you're accessing frontend via `http://localhost:8080` (not `127.0.0.1`)

### Issue 4: Database Connection Failed
**Symptom:** Server crashes or "Database connection failed"

**Solution:**
- Check `server/.env` has correct database credentials
- Verify PostgreSQL is running
- Check database name matches: `DB_NAME=mydatabase` (or your actual DB name)

## Testing Endpoints

1. **Health Check:**
   ```
   GET http://localhost:5000/api/health
   ```

2. **Test Endpoint:**
   ```
   GET http://localhost:5000/api/test
   ```

3. **Lessons:**
   ```
   GET http://localhost:5000/api/lessons
   ```

4. **Signup:**
   ```
   POST http://localhost:5000/api/auth/signup
   Body: { "email": "test@example.com", "password": "password123" }
   ```

5. **Login:**
   ```
   POST http://localhost:5000/api/auth/login
   Body: { "email": "test@example.com", "password": "password123" }
   ```

## First Lesson Unlocked

The first lesson (LS001) should be automatically unlocked:
- On new user signup
- On first login
- In guest mode
- If progress is empty

If LS001 is still locked:
1. Check browser console for errors
2. Verify user_progress table has `unlocked_lessons` with `['LS001']`
3. Check database column type is `TEXT[]` not `INTEGER[]`

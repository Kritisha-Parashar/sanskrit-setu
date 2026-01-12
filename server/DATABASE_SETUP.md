# PostgreSQL Database Setup

## Step 1: Create PostgreSQL User (if needed)

If you get an error that role "pavitra" does not exist, create it:

```bash
sudo -u postgres createuser -s pavitra
```

Or if you prefer to use the `postgres` user directly, skip this step.

## Step 2: Create the Database

Run one of these commands:

**Option A - Using your user:**
```bash
createdb sanskrit_setu
```

**Option B - Using postgres user with sudo:**
```bash
sudo -u postgres createdb sanskrit_setu
```

**Option C - Using psql:**
```bash
psql -U postgres -c "CREATE DATABASE sanskrit_setu;"
```

**Option D - Interactive psql:**
```bash
psql -U postgres
```
Then in the psql prompt:
```sql
CREATE DATABASE sanskrit_setu;
\q
```

## Step 3: Verify Database Creation

Check if the database was created:
```bash
psql -l | grep sanskrit_setu
```

Or:
```bash
psql -U postgres -l | grep sanskrit_setu
```

## Step 4: Create .env File

Create a `.env` file in the `server/` directory with the following content:

```env
# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:8080

# Database Configuration
# Update these with your actual PostgreSQL credentials
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sanskrit_setu
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT Secret (change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Important:** Replace `your_postgres_password` with your actual PostgreSQL password, and change `JWT_SECRET` to a secure random string.

## Step 5: Test the Setup

Start the server:
```bash
cd server
npm run dev
```

The server will automatically create the necessary tables (`users` and `user_progress`) on startup.

## Troubleshooting

### "role does not exist" error
- Create the PostgreSQL user as shown in Step 1
- Or use the `postgres` user by updating `DB_USER` in `.env`

### "password authentication failed"
- Update the `DB_PASSWORD` in `.env` with your correct PostgreSQL password
- Or configure PostgreSQL to use peer authentication for local connections

### "database does not exist"
- Make sure you completed Step 2 and the database was created successfully
- Verify with: `psql -l | grep sanskrit_setu`

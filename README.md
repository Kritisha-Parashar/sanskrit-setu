# Sanskrit-Setu

A modern Sanskrit learning platform with Express.js backend and PostgreSQL database.

## Project Structure

```
sanskrit-setu/
├── server/          # Express.js backend (TypeScript)
│   ├── src/
│   │   ├── db/      # Database connection and initialization
│   │   ├── routes/  # API routes
│   │   └── middleware/ # Auth middleware
│   └── package.json
└── src/             # React frontend
    ├── lib/         # Utilities including auth
    ├── pages/       # React pages
    └── components/  # React components
```

## Setup Instructions

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Set up PostgreSQL database:
   - Make sure PostgreSQL is installed and running
   - Create a database named `sanskrit_setu` (or update the DB_NAME in .env)
   - Update the `.env` file with your database credentials

4. Create `.env` file in the server directory:
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

5. Run the server:
```bash
npm run dev
```

The server will automatically create the necessary database tables on startup.

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file in the root directory (optional):
```env
VITE_API_URL=http://localhost:3000/api
```

3. Run the development server:
```bash
npm run dev
```

## Authentication

The application uses JWT-based authentication:
- Sign up: `POST /api/auth/signup`
- Login: `POST /api/auth/login`
- Get current user: `GET /api/auth/me`
- Logout: `POST /api/auth/logout`

Tokens are stored in localStorage on the frontend and sent with each authenticated request.

## Database Schema

### users
- id (SERIAL PRIMARY KEY)
- email (VARCHAR UNIQUE)
- password_hash (VARCHAR)
- name (VARCHAR)
- role (VARCHAR, default: 'student')
- created_at, updated_at (TIMESTAMP)

### user_progress
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER, FOREIGN KEY)
- xp (INTEGER)
- completed_lessons (INTEGER[])
- unlocked_lessons (INTEGER[])
- created_at, updated_at (TIMESTAMP)

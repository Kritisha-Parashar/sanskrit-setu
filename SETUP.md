# Sanskrit Setu - Complete Setup Guide

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Quick Start](#quick-start)
3. [Architecture Overview](#architecture-overview)
4. [Detailed Setup](#detailed-setup)
   - [Frontend Setup](#frontend-setup)
   - [Backend Setup](#backend-setup)
   - [ML Service Setup](#ml-service-setup)
   - [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Environment Variables](#environment-variables)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)
9. [Development Tips](#development-tips)
10. [Deployment](#deployment)

---

## System Requirements

### Hardware

- **CPU:** Modern multi-core processor recommended (2+ cores minimum)
- **RAM:** 8GB minimum (16GB+ recommended for ML inference)
- **GPU:** Optional (NVIDIA with CUDA support for faster Whisper inference)
  - With GPU: ~0.5s per audio evaluation
  - Without GPU: ~3-5s per audio evaluation

### Software

- **Node.js:** 18.x or 20.x LTS
- **Python:** 3.10, 3.11, or 3.12
- **PostgreSQL:** 12+ (local or remote)
- **FFmpeg:** 4.0+ (for audio format conversion)
- **Git:** 2.0+

### Installation Commands

#### macOS

```bash
# Install Homebrew if not present
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install node postgresql ffmpeg git
brew services start postgresql
```

#### Ubuntu/Debian

```bash
# Update package lists
sudo apt-get update

# Install dependencies
sudo apt-get install -y nodejs npm python3 python3-venv postgresql postgresql-contrib ffmpeg git

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Windows (PowerShell - Admin)

```powershell
# Install Chocolatey if not present
Set-ExecutionPolicy Bypass -Scope Process -Force; `
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; `
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Restart terminal and install
choco install nodejs python postgresql ffmpeg git -y
```

#### Verify Installation

```bash
node --version      # v18.x or v20.x
npm --version       # 9.x or higher
python3 --version   # 3.10+
psql --version      # 12+
ffmpeg -version     # 4.0+
```

---

## Quick Start

### 1. Environment Setup (5 minutes)

```bash
# Navigate to project root
cd /home/pavitra/dev/sanskrit-setu

# Create root environment file
cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sanskrit_setu
DB_USER=sanskrit_user
DB_PASSWORD=your_secure_password
NODE_ENV=development
ML_SERVICE_URL=http://localhost:8000
VITE_API_BASE=http://localhost:3000
EOF

# Create backend environment file
cat > server/.env << 'EOF'
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sanskrit_setu
DB_USER=sanskrit_user
DB_PASSWORD=your_secure_password
NODE_ENV=development
ML_SERVICE_URL=http://localhost:8000
JWT_SECRET=your_jwt_secret_key_here
EOF
```

### 2. Database Setup (3 minutes)

```bash
# Create PostgreSQL user and database
sudo -u postgres psql << 'EOF'
CREATE USER sanskrit_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE sanskrit_setu OWNER sanskrit_user;
GRANT ALL PRIVILEGES ON DATABASE sanskrit_setu TO sanskrit_user;
EOF

# Run migrations
cd server
npm install
node setup-database.js
```

### 3. Install Dependencies

```bash
# Root frontend
npm install
bun install  # or npm install if not using bun

# Backend
cd server
npm install

# ML Service
cd ../ml-service
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Start Services (in separate terminals)

```bash
# Terminal 1: ML Service
cd ml-service
source venv/bin/activate
bash run.sh

# Terminal 2: Backend
cd server
npm run dev:backend

# Terminal 3: Frontend
cd /home/pavitra/dev/sanskrit-setu
npm run dev
```

### 5. Access Application

- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:3000
- **ML Service:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

**Test Voice Practice:**
Navigate to `/voice-practice` on the frontend (http://localhost:8080/voice-practice)

---

## Architecture Overview

### High-Level Flow

```
[Browser]
    ↓ (MediaRecorder WebM)
[Frontend React App - :8080]
    ↓ (POST /api/voice/evaluate with base64 audio)
[Vite Dev Proxy]
    ↓
[Express Backend - :3000]
    ↓ (axios POST to ML service)
[FastAPI ML Service - :8000]
    ↓ (FFmpeg conversion WebM→WAV)
    ↓ (Whisper ASR transcription)
    ↓ (Romanized-to-Devanagari conversion)
    ↓ (Phoneme comparison scoring)
[Response: score, feedback, transcription]
    ↓ (Backend stores to PostgreSQL)
[Database]
```

### Components

| Service    | Port | Language       | Purpose                                          |
| ---------- | ---- | -------------- | ------------------------------------------------ |
| Frontend   | 8080 | React/TS       | UI, voice recording, display results             |
| Backend    | 3000 | Express/TS     | REST API, authentication, data persistence       |
| ML Service | 8000 | FastAPI/Python | ASR, pronunciation scoring, phoneme analysis     |
| Database   | 5432 | PostgreSQL     | Store user data, attempts, pronunciation history |

### Technology Stack

**Frontend:**

- React 18
- TypeScript
- Vite (dev server)
- TailwindCSS + shadcn/ui components
- MediaRecorder API (browser's native audio recording)
- Axios (HTTP client)

**Backend:**

- Express.js
- TypeScript
- JWT authentication
- PostgreSQL with connection pooling
- Axios (calls ML service)

**ML Service:**

- FastAPI
- OpenAI Whisper (base model)
- PyTorch + TorchAudio
- librosa (audio loading)
- indic-transliteration (romanized → Devanagari conversion)
- FFmpeg (audio format conversion)

**Database:**

- PostgreSQL 12+
- 3 main tables: word_metadata, pronunciation_attempts, reference_audio

---

## Detailed Setup

### Frontend Setup

#### Installation

```bash
cd /home/pavitra/dev/sanskrit-setu

# Install dependencies
npm install
# OR
bun install
```

#### Configuration

Vite proxy is **already configured** in `vite.config.ts`:

```typescript
proxy: {
  "/api": {
    target: "http://localhost:3000",
    changeOrigin: true
  }
}
```

This allows frontend dev server (:8080) to proxy API calls to backend (:3000).

#### Running

```bash
npm run dev
```

Frontend will be available at `http://localhost:8080`

#### Build

```bash
npm run build
```

Output: `dist/` directory ready for deployment.

---

### Backend Setup

#### Installation

```bash
cd server
npm install
```

#### Configuration

Create `server/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sanskrit_setu
DB_USER=sanskrit_user
DB_PASSWORD=your_secure_password
NODE_ENV=development
ML_SERVICE_URL=http://localhost:8000
JWT_SECRET=your_jwt_secret_key_here_min_32_chars
PORT=3000
```

**Note:** ML_SERVICE_URL should point to FastAPI server. For distributed setup, change to the ML service host/IP.

#### Database Initialization

```bash
# Ensure PostgreSQL is running
cd server

# Run setup script (creates database if needed, runs migrations)
node setup-database.js
```

This script:

1. Checks PostgreSQL connection
2. Creates database if it doesn't exist
3. Applies migrations (word_metadata, pronunciation_attempts, reference_audio tables)
4. Populates test data (5 Sanskrit words for testing)

#### Running

```bash
# Development mode (hot reload)
npm run dev:backend

# Production mode
npm run build
npm start
```

Backend API available at `http://localhost:3000`

#### API Endpoints

**Voice Evaluation:**

```
POST /api/voice/evaluate
Content-Type: application/json

Body:
{
  "word_expected": "अश्वः",
  "audio_base64": "data:audio/webm;base64,..."
}

Response:
{
  "word_match": true,
  "score": 85,
  "transcription": "ashwa",
  "feedback": "Good pronunciation!",
  "phoneme_sequence_expected": "ə-ʃ-w-ə",
  "phoneme_sequence_actual": "ə-ʃ-w-ə",
  "similarity_score": 0.95
}
```

**User Statistics:**

```
GET /api/voice/stats
Authorization: Bearer <token>

Response:
{
  "total_attempts": 15,
  "average_score": 82.5,
  "correct_matches": 12,
  "unique_words": 5,
  "last_attempt": "2024-04-04T10:30:00Z"
}
```

**Word Attempts History:**

```
GET /api/voice/attempts/:wordId
Authorization: Bearer <token>

Response:
[
  {
    "attempt_id": 1,
    "score": 85,
    "word_match": true,
    "feedback": "Good!",
    "created_at": "2024-04-04T10:30:00Z"
  },
  ...
]
```

---

### ML Service Setup

#### Installation

```bash
cd ml-service

# Create Python virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate

# On Windows:
# venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

#### PyTorch & CUDA (Optional GPU Support)

Default `requirements.txt` uses CPU-only PyTorch. For GPU support:

```bash
# With NVIDIA CUDA 11.8
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# With NVIDIA CUDA 12.1
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

#### Configuration

Create `ml-service/.env` (optional):

```env
WHISPER_MODEL=base
DEVICE=cuda  # or 'cpu'
ML_SERVICE_URL=http://0.0.0.0:8000
```

#### Model Download

The first time you run the service, Whisper base model (~141 MB) will auto-download to:

- Linux/macOS: `~/.cache/huggingface/hub/` or `~/.cache/whisper/`
- Windows: `%APPDATA%/Hugging Face/hub/` or `%APPDATA%/openai/model cache/`

To pre-download:

```bash
python3 << 'EOF'
import whisper
model = whisper.load_model("base")
print("Model loaded and cached successfully")
EOF
```

#### FFmpeg Requirement

**Why:** Browser MediaRecorder outputs WebM format, but Whisper works best with WAV. FFmpeg converts WebM → WAV.

**Verify Installation:**

```bash
ffmpeg -version
```

If not installed, see [System Requirements](#system-requirements).

#### Running

```bash
# From ml-service directory
bash run.sh
```

This script:

1. Checks virtual environment
2. Verifies FFmpeg installation
3. Starts FastAPI server on http://localhost:8000

API Documentation: http://localhost:8000/docs (Swagger UI)

#### API Endpoints

**Evaluate Pronunciation:**

```
POST /evaluate
Content-Type: application/json

Body:
{
  "audio_base64": "data:audio/webm;base64,SUQzBAA...",
  "word_expected": "अश्वः"
}

Response:
{
  "transcription": "ashwa",
  "word_match": true,
  "score": 85,
  "feedback": "Good pronunciation of the Sanskrit word!",
  "phoneme_sequence_expected": "ə-ʃ-w-ə",
  "phoneme_sequence_actual": "ə-ʃ-w-ə",
  "similarity_score": 0.95
}
```

#### Code Structure

- `main.py` — FastAPI app, Whisper model loading, /evaluate endpoint
- `phoneme_scorer.py` — Sanskrit phoneme mapping, romanized-to-Devanagari conversion, IPA comparison
- `requirements.txt` — Python dependencies
- `run.sh` — Startup script with environment checks

---

### Database Setup

#### PostgreSQL Installation

See [System Requirements](#system-requirements) for OS-specific install commands.

#### Verify Connection

```bash
psql -h localhost -U postgres -d postgres -c "SELECT version();"
```

#### Create User & Database

```bash
# Using PostgreSQL superuser
sudo -u postgres psql << 'EOF'
-- Create user
CREATE USER sanskrit_user WITH PASSWORD 'your_secure_password';

-- Create database
CREATE DATABASE sanskrit_setu OWNER sanskrit_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE sanskrit_setu TO sanskrit_user;

-- Connect and grant schema privileges
\c sanskrit_setu
GRANT ALL PRIVILEGES ON SCHEMA public TO sanskrit_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sanskrit_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sanskrit_user;
EOF
```

#### Initialize Schema

```bash
cd server
node setup-database.js
```

This creates:

1. **word_metadata** — Sanskrit words with Devanagari, romanized, IPA phonemes
2. **pronunciation_attempts** — Student recording attempts with scores and feedback
3. **reference_audio** — Reference audio for Phase 3 acoustic similarity

#### Verify Schema

```bash
psql -h localhost -U sanskrit_user -d sanskrit_setu -c "\dt"
```

Expected output:

```
             List of relations
 Schema |         Name         | Type  | Owner
--------+----------------------+-------+--------
 public | pronunciation_attempts | table | sanskrit_user
 public | reference_audio        | table | sanskrit_user
 public | word_metadata          | table | sanskrit_user
```

---

## Running the Application

### Start All Services

**Option 1: Separate Terminals** (Recommended for Development)

```bash
# Terminal 1: ML Service (from ml-service/)
cd /home/pavitra/dev/sanskrit-setu/ml-service
source venv/bin/activate
bash run.sh

# Terminal 2: Backend (from server/)
cd /home/pavitra/dev/sanskrit-setu/server
npm run dev:backend

# Terminal 3: Frontend
cd /home/pavitra/dev/sanskrit-setu
npm run dev
```

**Option 2: Background Processes** (Linux/macOS)

```bash
# Start ML service in background
cd /home/pavitra/dev/sanskrit-setu/ml-service
source venv/bin/activate
nohup bash run.sh > ml-service.log 2>&1 &
echo $! > ml-service.pid

# Start backend in background
cd /home/pavitra/dev/sanskrit-setu/server
nohup npm run dev:backend > backend.log 2>&1 &
echo $! > backend.pid

# Start frontend in background
cd /home/pavitra/dev/sanskrit-setu
nohup npm run dev > frontend.log 2>&1 &
echo $! > frontend.pid

# View logs
tail -f ml-service.log
tail -f backend.log
tail -f frontend.log
```

### Access Points

| Service         | URL                                  | Purpose                   |
| --------------- | ------------------------------------ | ------------------------- |
| Frontend        | http://localhost:8080                | Main application UI       |
| Voice Practice  | http://localhost:8080/voice-practice | Test voice evaluation     |
| Backend API     | http://localhost:3000                | API endpoints             |
| ML Service Docs | http://localhost:8000/docs           | Swagger API documentation |

### Health Checks

```bash
# Check frontend
curl http://localhost:8080

# Check backend
curl http://localhost:3000/api/health  # if health endpoint exists

# Check ML service
curl http://localhost:8000/docs
```

---

## Environment Variables

### Root `.env`

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sanskrit_setu
DB_USER=sanskrit_user
DB_PASSWORD=your_secure_password

# Application
NODE_ENV=development

# Services
ML_SERVICE_URL=http://localhost:8000
VITE_API_BASE=http://localhost:3000
```

### Server `server/.env`

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sanskrit_setu
DB_USER=sanskrit_user
DB_PASSWORD=your_secure_password

# Application
NODE_ENV=development
PORT=3000

# Security
JWT_SECRET=your_very_long_secret_key_minimum_32_characters_recommended

# ML Service
ML_SERVICE_URL=http://localhost:8000

# Logging
LOG_LEVEL=debug
```

### ML Service `.env` (Optional)

```env
# Model Configuration
WHISPER_MODEL=base
DEVICE=cuda  # or 'cpu'

# Service
WORKERS=4
LOG_LEVEL=info
```

### Environment Variable Reference

| Variable       | Purpose                   | Example                    |
| -------------- | ------------------------- | -------------------------- |
| DB_HOST        | PostgreSQL server address | localhost                  |
| DB_PORT        | PostgreSQL port           | 5432                       |
| DB_NAME        | Database name             | sanskrit_setu              |
| DB_USER        | Database username         | sanskrit_user              |
| DB_PASSWORD    | Database password         | secure_password            |
| NODE_ENV       | Node environment          | development, production    |
| JWT_SECRET     | JWT signing key           | random_32+\_char_string    |
| ML_SERVICE_URL | FastAPI server address    | http://localhost:8000      |
| WHISPER_MODEL  | Whisper model size        | base, small, medium, large |
| DEVICE         | PyTorch device            | cuda, cpu                  |

---

## Testing

### Frontend Testing

```bash
# From root directory
npm run build

# Test build output
npm run preview
```

### Frontend - Manual Testing

1. Navigate to http://localhost:8080/voice-practice
2. Click "Start Recording"
3. Pronounce the Sanskrit word displayed
4. Click "Stop Recording"
5. Observe the score and feedback

### Backend Testing

```bash
# Test API endpoint (example)
curl -X POST http://localhost:3000/api/voice/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "word_expected": "अश्वः",
    "audio_base64": "data:audio/webm;base64,...base64_encoded_audio..."
  }'
```

### ML Service Testing

1. Visit http://localhost:8000/docs
2. Expand `/evaluate` endpoint
3. Click "Try it out"
4. Paste base64-encoded audio and expected word
5. Execute and view response

### End-to-End Testing

```bash
# 1. Start all services
# Terminal 1: ML Service
cd ml-service && source venv/bin/activate && bash run.sh

# Terminal 2: Backend
cd server && npm run dev:backend

# Terminal 3: Frontend
npm run dev

# 4. Test in browser
# Navigate to http://localhost:8080/voice-practice
# Record, evaluate, check database

# 5. Verify database
psql -h localhost -U sanskrit_user -d sanskrit_setu
> SELECT * FROM pronunciation_attempts LIMIT 5;
```

### Database Verification

```bash
# Connect to database
psql -h localhost -U sanskrit_user -d sanskrit_setu

# View tables
\dt

# Check test data
SELECT * FROM word_metadata;
SELECT * FROM pronunciation_attempts ORDER BY created_at DESC LIMIT 5;

# Check statistics
SELECT COUNT(*) as total_attempts FROM pronunciation_attempts;
SELECT AVG(score) as avg_score FROM pronunciation_attempts;
```

---

## Troubleshooting

### Frontend Issues

#### Port 8080 Already in Use

```bash
# Find process using port 8080
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
npm run dev -- --port 3001
```

#### CORS Errors from Backend

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:** Verify Vite proxy is configured in `vite.config.ts`:

```typescript
server: {
  proxy: {
    "/api": {
      target: "http://localhost:3000",
      changeOrigin: true
    }
  }
}
```

Restart frontend: `npm run dev`

#### Audio not Uploading

**Error:** `Failed to evaluate pronunciation`

**Checklist:**

1. Browser allows microphone access
2. Backend is running (`npm run dev:backend`)
3. ML service is running (`bash run.sh`)
4. Check browser console for error messages

---

### Backend Issues

#### Cannot Connect to Database

```bash
# Verify PostgreSQL is running
# macOS
brew services list | grep postgres

# Ubuntu/Debian
sudo systemctl status postgresql

# Windows
Services → PostgreSQL-x64

# Check credentials
psql -h localhost -U sanskrit_user -d sanskrit_setu

# If password prompt fails, update .env
```

#### ML Service Not Responding

**Error:** `ECONNREFUSED http://localhost:8000`

**Checklist:**

1. ML service is running (`bash run.sh`)
2. ML_SERVICE_URL in `.env` is correct
3. Firewall allows localhost:8000
4. Running: `curl http://localhost:8000/docs`

#### Port 3000 Already in Use

```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>
```

---

### ML Service Issues

#### FFmpeg Not Found

**Error:** `ffmpeg: not found` or `Cannot find FFmpeg`

**Solution:**

```bash
# Check installation
ffmpeg -version

# If not installed, install via package manager
# macOS
brew install ffmpeg

# Ubuntu
sudo apt-get install ffmpeg

# Windows via Chocolatey (admin terminal)
choco install ffmpeg
```

#### Whisper Model Not Loading

**Error:** `RuntimeError: cannot import name 'SAMPLERATE'`

**Solution:** Update torch and torchaudio

```bash
cd ml-service
source venv/bin/activate
pip install --upgrade torch torchaudio librosa
```

#### Slow Inference (5+ seconds)

**Cause:** Running on CPU instead of GPU

**Solution:** Install GPU-enabled PyTorch

```bash
# NVIDIA with CUDA 12.1
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

#### Out of Memory (OOM) Error

**Solution:** Use smaller Whisper model or reduce batch size

```python
# In main.py, change:
model = whisper.load_model("tiny")  # instead of "base"
```

---

### Database Issues

#### Cannot Create User/Database

**Error:** `permission denied for schema public`

**Solution:**

```bash
# Connect as superuser
sudo -u postgres psql
postgres=# GRANT ALL PRIVILEGES ON SCHEMA public TO sanskrit_user;
postgres=# GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sanskrit_user;
postgres=# \q
```

#### Migrations Not Applied

**Error:** Tables `word_metadata`, `pronunciation_attempts` don't exist

**Solution:**

```bash
cd server
node setup-database.js

# Verify
psql -h localhost -U sanskrit_user -d sanskrit_setu -c "\dt"
```

#### Connection Pool Exhausted

**Error:** `Client request timeout / no more connections available`

**Solution:** Increase pool size in `server/src/db/connection.ts`:

```typescript
const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_STRING,
  max: 20, // Increase from default 10
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

### Audio Issues

#### Audio Upload Returns 400 Bad Request

**Error:** `Invalid audio format decoded`

**Checklist:**

1. Audio is encoded as base64
2. Base64 string is complete (no truncation)
3. Format is WebM or WAV (remove data URL prefix)
4. ML service has FFmpeg installed

**Debug:**

```javascript
// In browser console
console.log(audioBlob.type); // Should be "audio/webm"
console.log(base64String.substring(0, 50)); // Check base64 format
```

#### Transcription Completely Wrong

**Cause:** Audio quality too low or not recognizable as speech

**Solution:**

1. Ensure clear pronunciation
2. Use noise-free environment
3. Check microphone levels
4. Try the same audio in Whisper CLI to verify

---

### Network Issues

#### Services on Different Machines

**Setup:** If ML service is on separate host:

1. Update backend `.env`:

```env
ML_SERVICE_URL=http://192.168.1.100:8000  # ML service host IP
```

2. Update ML service `fastapi_cors`:

```python
# In main.py, add CORS
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

3. Ensure firewall allows connections on port 8000

---

## Development Tips

### Local Development Workflow

1. **Start services in order:**

   ```bash
   # Terminal 1
   cd ml-service && source venv/bin/activate && bash run.sh

   # Terminal 2
   cd server && npm run dev:backend

   # Terminal 3
   cd /root/project && npm run dev
   ```

2. **Monitor logs:** Keep terminals open to watch for errors

3. **Restart frontend on config change:**

   ```bash
   # Vite hot reload works for TSX/CSS
   # For .env changes, must manually restart
   ```

4. **Use VS Code extensions:**
   - Python, Pylance
   - ES7+ React/Redux/React-Native snippets
   - PostgreSQL explorer

### Code Organization

```
/project
├── src/                    # Frontend React code
│   ├── components/        # React components
│   ├── pages/             # Page-level components
│   ├── api/               # API integration
│   ├── types/             # TypeScript types
│   └── ...
├── server/                # Backend Express code
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── db/            # Database setup
│   │   ├── middleware/    # Express middleware
│   │   └── ...
│   └── ...
├── ml-service/            # ML service FastAPI
│   ├── main.py           # FastAPI app
│   ├── phoneme_scorer.py # Phoneme comparison
│   ├── requirements.txt  # Python deps
│   └── ...
└── package.json          # Root dependencies
```

### Adding New Features

#### Add Backend Route

1. Create new file in `server/src/routes/`
2. Define Express route handler
3. Import in `server/src/index.ts`
4. Update `.env` if new env vars needed

#### Add Frontend Page

1. Create `.tsx` file in `src/pages/`
2. Define React component
3. Add route in `src/App.tsx`
4. Link navigation in components

#### Add ML Functionality

1. Implement function in `ml-service/phoneme_scorer.py`
2. Add FastAPI endpoint in `main.py` if needed
3. Update backend route to call new endpoint
4. Test via `http://localhost:8000/docs`

### Debugging Tips

#### Frontend Debugging

```javascript
// Browser console
localStorage.setItem("debug", "api_calls");
console.log("Response:", response.data);

// React DevTools extension
// Redux DevTools (if using Redux)
```

#### Backend Debugging

```typescript
// Add debug logs
console.log("ML Service response:", evaluationResponse);

// Use debugger
// VS Code: F5 to start, set breakpoints
```

#### ML Service Debugging

```python
# Add print statements
print(f"Audio shape: {audio.shape}")
print(f"Transcription: {transcription}")

# Use FastAPI interactive docs
# http://localhost:8000/docs
```

### Performance Optimization

**Frontend:**

- Use React DevTools Profiler to identify slow renders
- Memoize expensive components: `React.memo()`
- Lazy load routes: `React.lazy()`

**Backend:**

- Use connection pooling (already configured)
- Add database indexes for frequent queries
- Cache ML service responses if applicable

**ML Service:**

- Use GPU when available (install CUDA PyTorch)
- Batch requests if high volume
- Cache loaded models (done via lifespan manager)

---

## Deployment

### Frontend Deployment

#### Build Production Bundle

```bash
npm run build
```

Output: `dist/` directory

#### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Authenticate
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

#### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Deploy to Traditional Server (Nginx)

```bash
# 1. Build
npm run build

# 2. Copy dist to server
scp -r dist/ user@server:/var/www/sanskrit-setu/

# 3. Configure Nginx
# /etc/nginx/sites-available/sanskrit-setu
server {
    listen 80;
    server_name sanskrit-setu.com;
    root /var/www/sanskrit-setu/dist;
    index index.html;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}

# 4. Enable and restart
sudo systemctl enable nginx
sudo systemctl restart nginx
```

### Backend Deployment

#### Using PM2 (Recommended for Node.js)

```bash
# Install PM2 globally
npm install -g pm2

# Start app
cd server
pm2 start "npm start" --name "sanskrit-backend"

# Save ecosystem
pm2 save

# Start on reboot
pm2 startup
```

#### Using Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/src ./src
COPY server/tsconfig.json ./

EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t sanskrit-backend .
docker run -p 3000:3000 --env-file .env sanskrit-backend
```

### ML Service Deployment

#### Using Gunicorn + Uvicorn

```bash
cd ml-service
source venv/bin/activate

# Using Gunicorn with Uvicorn workers
pip install gunicorn

gunicorn main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

#### Using Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY ml-service/requirements.txt .
RUN apt-get update && apt-get install -y ffmpeg
RUN pip install --no-cache-dir -r requirements.txt

COPY ml-service/ .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Database Deployment

#### Managed PostgreSQL (Recommended)

Options:

- AWS RDS PostgreSQL
- Google Cloud SQL
- Azure PostgreSQL
- DigitalOcean Managed PostgreSQL

Update connection string in `.env`:

```env
DB_CONNECTION_STRING=postgresql://user:password@host:5432/db_name
```

#### Self-Hosted PostgreSQL

```bash
# Install on Ubuntu server
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Configure for remote connections
# /etc/postgresql/14/main/postgresql.conf
listen_addresses = '*'

# /etc/postgresql/14/main/pg_hba.conf
host all all 0.0.0.0/0 md5

# Restart
sudo systemctl restart postgresql
```

### Environment Setup for Production

Create `production.env`:

```env
# Security
NODE_ENV=production
JWT_SECRET=use_very_long_random_key_here
TLS_ENABLED=true

# Database (use managed service URL)
DB_CONNECTION_STRING=postgresql://user:pass@prod-db.example.com:5432/sanskrit_setu

# Services
ML_SERVICE_URL=https://ml-api.example.com
FRONTEND_URL=https://sanskrit-setu.com

# Logging
LOG_LEVEL=info
SENTRY_DSN=your_sentry_dsn_for_error_tracking

# Whisper Model
WHISPER_MODEL=base
```

### Health Checks & Monitoring

#### Backend Health Check Endpoint

```typescript
// In server/src/index.ts
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});
```

#### Monitor with Uptime Robot / Better Stack

```bash
# Check endpoint
curl https://api.sanskrit-setu.com/health
```

#### Log Monitoring

Use services like:

- Sentry (error tracking)
- LogRocket (session replay)
- ELK Stack (self-hosted logging)
- Datadog / New Relic

---

## Additional Resources

- **React Documentation:** https://react.dev
- **Express.js Guide:** https://expressjs.com
- **FastAPI Tutorial:** https://fastapi.tiangolo.com
- **PostgreSQL Docs:** https://www.postgresql.org/docs
- **Whisper GitHub:** https://github.com/openai/whisper
- **Sanskrit IPA Reference:** Phonetic documentation
- **Devanagari Unicode:** https://en.wikipedia.org/wiki/Devanagari_(Unicode_block)

---

## Support & Troubleshooting

For issues:

1. Check **Troubleshooting** section above
2. Review service logs
3. Verify all services are running
4. Check `.env` file configuration
5. Ensure database is initialized

For bugs or feature requests:

- Create GitHub issue with:
  - Error messages (full stack trace)
  - Steps to reproduce
  - OS and software versions
  - Screenshots/recordings if UI-related

---

**Last Updated:** April 4, 2026
**Version:** 1.0 (Phase 1)
**Status:** Production Ready

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

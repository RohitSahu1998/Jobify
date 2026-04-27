# ⚡ Quick Start Guide

## 🎯 Goal: Get Jobify Running in 15 Minutes

---

## Step 1: Check What You Have (2 min)

```bash
python check_prerequisites.py
```

This will tell you exactly what's missing.

---

## Step 2: Install PostgreSQL (5 min)

### Windows
1. Download: https://www.postgresql.org/download/windows/
2. Run installer (keep defaults, port 5432)
3. Remember the password you set!

### Create Database
```bash
# Open Command Prompt or PowerShell
psql -U postgres
# Enter your password when prompted

# In psql:
CREATE DATABASE jobify_db;
\q
```

---

## Step 3: Setup Backend (3 min)

```bash
# Activate virtual environment
cd job-platform
source venv/Scripts/activate  # Git Bash
# OR venv\Scripts\activate.bat (CMD)
# OR venv\Scripts\Activate.ps1 (PowerShell)

# Install dependencies
cd backend
pip install -r requirements.txt

# Update .env with your PostgreSQL password
# Edit backend/.env and change:
# DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/jobify_db

# Generate secure key
python generate_secret_key.py
# Type 'y' when asked to update .env

# Create database tables
python init_db.py
```

You should see:
```
✅ Database initialized successfully!
📋 Tables created:
   ✓ users
   ✓ candidate_profiles
   ...
```

---

## Step 4: Start Backend (1 min)

```bash
# Still in backend folder
uvicorn app.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

Keep this terminal open!

---

## Step 5: Start Frontend (2 min)

Open a NEW terminal:

```bash
cd job-platform/frontend
npm install
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

---

## Step 6: Test It! (2 min)

1. Open browser: http://localhost:5173
2. Click "Get Started"
3. Register as Candidate
4. Check terminal for OTP (if email fails)
5. Verify and login!

---

## 🎉 You're Done!

### What to Try Next:

**As Candidate:**
1. Complete your profile
2. Upload a resume (PDF)
3. Upload proof documents or take skill tests
4. Get verified!

**As Company:**
1. Register with company role
2. Create company profile
3. Post a job
4. View matched candidates (score ≥ 3.5)

---

## 🐛 Something Not Working?

### Backend won't start
```bash
# Check database connection
cd backend
python check_db.py
```

### Frontend won't start
```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules
npm install
```

### Can't connect to database
```bash
# Test PostgreSQL
psql -U postgres -d jobify_db
# If this fails, PostgreSQL isn't running
```

### Import errors
```bash
# Reinstall Python dependencies
cd backend
pip install -r requirements.txt --force-reinstall
```

---

## 📚 Need More Help?

- **Detailed Setup**: See [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **What Changed**: See [CHANGES.md](CHANGES.md)
- **API Docs**: http://localhost:8000/docs (when backend is running)

---

## 🔑 Important URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| API Redoc | http://localhost:8000/redoc |

---

## 💡 Pro Tips

1. **Always activate venv** before running backend commands
2. **Keep both terminals open** (backend + frontend)
3. **Check logs** if something fails - they're very helpful
4. **Use check_db.py** to verify database before starting
5. **Generate new SECRET_KEY** for production use

---

## 🎯 Common Commands

```bash
# Check everything is ready
python check_prerequisites.py

# Check database
cd backend && python check_db.py

# Start backend
cd backend && uvicorn app.main:app --reload --port 8000

# Start frontend
cd frontend && npm run dev

# Run tests
cd backend && python tests/test_full_flow.py
```

---

## 🚀 You're All Set!

Enjoy building with Jobify! 🎉

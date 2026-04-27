# 🚀 START HERE - You Have PostgreSQL Installed!

Since PostgreSQL is already installed, you just need to complete the setup and run the app.

---

## ⚡ FASTEST WAY (Automated)

### Option 1: Double-click this file
```
setup_and_run.bat
```

This will:
1. ✅ Activate virtual environment
2. ✅ Install Python dependencies
3. ✅ Generate SECRET_KEY
4. ✅ Initialize database
5. ✅ Verify everything is ready

Then follow the instructions to start backend and frontend.

---

## 🎯 MANUAL WAY (Step by Step)

If you prefer to do it manually or the automated script fails:

### Step 1: Verify PostgreSQL Database Exists

**Option A: Using pgAdmin (GUI)**
1. Open pgAdmin (should be installed with PostgreSQL)
2. Connect to your server
3. Check if database `jobify_db` exists
4. If not, right-click "Databases" → Create → Database → Name: `jobify_db`

**Option B: Using SQL Shell (psql)**
1. Open "SQL Shell (psql)" from Start Menu
2. Press Enter for defaults (server, database, port, username)
3. Enter your PostgreSQL password
4. Run: `CREATE DATABASE jobify_db;` (if it doesn't exist)
5. Run: `\l` to list databases and verify `jobify_db` exists
6. Type: `\q` to quit

**Option C: Skip this if database already exists**
- The .env file shows: `jobify_db` should exist
- If backend starts without errors, database exists

---

### Step 2: Setup Backend

Open Command Prompt or PowerShell in `job-platform` folder:

```bash
# Activate virtual environment
venv\Scripts\activate.bat

# Go to backend
cd backend

# Install dependencies (includes new pymupdf and fastapi-mail)
pip install -r requirements.txt

# Generate secure SECRET_KEY
python generate_secret_key.py
# Type 'y' when asked to update .env

# Initialize database (creates all tables)
python init_db.py
```

**Expected output from init_db.py:**
```
🔧 Initializing database...
📦 Loading models...
🏗️  Creating tables...
✅ Database initialized successfully!
📋 Tables created:
   ✓ users
   ✓ candidate_profiles
   ✓ company_profiles
   ✓ jobs
   ✓ proof_documents
   ✓ test_attempts
   ✓ candidate_scores
```

---

### Step 3: Start Backend Server

**Option A: Use the batch file**
```
Double-click: start_backend.bat
```

**Option B: Manual command**
```bash
# Make sure you're in backend folder with venv activated
uvicorn app.main:app --reload --port 8000
```

**You should see:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**Keep this terminal/window open!**

---

### Step 4: Start Frontend Server

Open a **NEW** Command Prompt or PowerShell:

**Option A: Use the batch file**
```
Double-click: start_frontend.bat
```

**Option B: Manual command**
```bash
cd job-platform\frontend
npm install
npm run dev
```

**You should see:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

**Keep this terminal/window open too!**

---

### Step 5: Open the Application

Open your browser and go to:
```
http://localhost:5173
```

---

## 🧪 Test the Application

### Test as Candidate:
1. Click "Get Started"
2. Select "👤 Candidate"
3. Register with email/password
4. **Check backend terminal for OTP** (look for `dev_otp` if email fails)
5. Enter OTP to verify
6. Login
7. Complete your profile
8. Upload a resume (any PDF file)
9. View parsed data (skills, education, experience)
10. Upload proof documents or take skill tests

### Test as Company:
1. Register with "🏢 Company" role
2. Verify OTP and login
3. Create company profile
4. Post a job with required skills
5. View matched candidates (after candidates complete verification)

---

## 🐛 Troubleshooting

### Database Connection Error

**Error:** `could not connect to server` or `connection refused`

**Solution:**
1. Check if PostgreSQL service is running:
   - Press `Win + R`
   - Type: `services.msc`
   - Look for `postgresql-x64-15` (or similar)
   - If stopped, right-click → Start

2. Verify database exists:
   - Open pgAdmin
   - Check if `jobify_db` database exists

3. Check .env file:
   - Open `backend/.env`
   - Verify `DATABASE_URL` has correct password
   - Format: `postgresql://postgres:YOUR_PASSWORD@localhost:5432/jobify_db`

---

### Import Errors

**Error:** `ModuleNotFoundError: No module named 'pymupdf'` or similar

**Solution:**
```bash
cd backend
pip install -r requirements.txt --force-reinstall
```

---

### Port Already in Use

**Error:** `Address already in use` on port 8000 or 5173

**Solution:**
```bash
# Find what's using the port
netstat -ano | findstr :8000

# Kill the process (replace <PID> with actual number)
taskkill /PID <PID> /F
```

---

### Virtual Environment Not Activating

**Error:** Script execution disabled

**Solution (PowerShell):**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try activating again:
```powershell
venv\Scripts\Activate.ps1
```

---

### Email OTP Not Received

**This is normal!** Email might fail in development.

**Solution:**
- Check the **backend terminal** for `dev_otp` in the response
- Copy that 6-digit code
- Use it to verify your email

---

## 📊 Verify Everything is Working

Run this command to check all prerequisites:
```bash
python check_prerequisites.py
```

Or check database specifically:
```bash
cd backend
python check_db.py
```

---

## 🎯 Quick Commands Reference

| Task | Command |
|------|---------|
| Setup everything | Double-click `setup_and_run.bat` |
| Start backend | Double-click `start_backend.bat` |
| Start frontend | Double-click `start_frontend.bat` |
| Check prerequisites | `python check_prerequisites.py` |
| Check database | `cd backend && python check_db.py` |
| Generate new key | `cd backend && python generate_secret_key.py` |

---

## 🔗 Important URLs

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:8000 |
| **API Docs (Swagger)** | http://localhost:8000/docs |
| **API Docs (ReDoc)** | http://localhost:8000/redoc |

---

## ✅ Success Checklist

Before testing, make sure:

- [ ] PostgreSQL service is running
- [ ] Database `jobify_db` exists
- [ ] Virtual environment is activated
- [ ] Backend dependencies installed
- [ ] SECRET_KEY generated (not default value)
- [ ] Database tables created (7 tables)
- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 5173
- [ ] Can access http://localhost:5173

---

## 🎉 You're Ready!

Everything is set up and ready to go. Just run the setup script or follow the manual steps above!

**Need help?** Check:
- `SETUP_GUIDE.md` - Detailed instructions
- `QUICK_START.md` - Fast setup guide
- Backend terminal - Error messages
- Frontend terminal - Error messages

---

## 💡 Pro Tips

1. **Keep both terminals open** - You need backend AND frontend running
2. **Check backend terminal for OTP** - If email fails, OTP shows there
3. **Use pgAdmin** - Easier than command line for database management
4. **Restart servers** - If something breaks, Ctrl+C and restart
5. **Check logs** - Error messages are very helpful

---

## 🚀 Let's Go!

Run this to get started:
```
setup_and_run.bat
```

Or follow the manual steps above. Either way, you'll be up and running in minutes! 🎊

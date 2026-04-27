# Job Platform — Complete Setup Guide

## 🚀 Quick Start

```bash
# 1. Check prerequisites
python check_prerequisites.py

# 2. Activate virtual environment
source venv/Scripts/activate  # Git Bash
# OR venv\Scripts\activate.bat (CMD)
# OR venv\Scripts\Activate.ps1 (PowerShell)

# 3. Install backend dependencies
cd backend
pip install -r requirements.txt

# 4. Generate secure SECRET_KEY
python generate_secret_key.py

# 5. Initialize database
python init_db.py

# 6. Start backend
uvicorn app.main:app --reload --port 8000

# 7. In another terminal - start frontend
cd frontend
npm install
npm run dev
```

Visit: http://localhost:5173

---

## 📋 Prerequisites

### ✅ Already Installed
- Python 3.11.9
- Node.js 24.14.0

### ❌ Need to Install
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/windows/)
- **Tesseract OCR** (Optional) - [Download](https://github.com/UB-Mannheim/tesseract/wiki)

---

## 🔧 What's Been Fixed

✅ **Added missing dependencies**
- `pymupdf==1.24.0` - Advanced PDF parsing for resumes
- `fastapi-mail==1.4.1` - Email service for OTP

✅ **Fixed hardcoded candidate_id bug**
- TakeTest.jsx now uses authenticated user from token

✅ **Made Tesseract path configurable**
- Auto-detects common installation paths
- Configurable via `TESSERACT_PATH` in .env

✅ **Created database initialization scripts**
- `init_db.py` - Creates all tables
- `check_db.py` - Verifies database connection
- `generate_secret_key.py` - Generates secure keys

✅ **Added comprehensive setup documentation**
- `SETUP_GUIDE.md` - Detailed setup instructions
- `check_prerequisites.py` - Automated prerequisite checker

---

## 📖 Detailed Setup

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for complete instructions including:
- PostgreSQL installation and configuration
- Tesseract OCR setup
- Database initialization
- Troubleshooting common issues

---

## 🗄️ Database Setup

### Step 1: Install PostgreSQL
Download and install from: https://www.postgresql.org/download/windows/

### Step 2: Create Database
```bash
psql -U postgres
CREATE DATABASE jobify_db;
\q
```

### Step 3: Update .env
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/jobify_db
```

### Step 4: Initialize Tables
```bash
cd backend
python check_db.py    # Verify connection
python init_db.py     # Create tables
```

---

## 🎯 System Flow

```
Candidate Registers
       ↓
Upload Resume → Auto-parsed (education, skills, experience)
       ↓
For each claim → Upload Proof OR select "No Proof"
       ↓
If No Proof → Skill Test assigned (tech/marketing/finance/general)
       ↓
Pass Test → Claim verified → Status: Test Verified
Upload Proof → OCR validates name match → Status: Verified
       ↓
Company posts Job → System scores all verified candidates
       ↓
Score >= 3.5 AND Verified → Candidate visible in Company Dashboard
```

---

## 📊 Scoring Breakdown (out of 5)

| Parameter           | Weight |
|---------------------|--------|
| Skills Match        | 40%    |
| Experience          | 20%    |
| Test Performance    | 20%    |
| Education Relevance | 10%    |
| Profile Completeness| 10%    |

Visibility Rule: Score >= 3.5 AND Status = Verified/Test Verified

---

## 🧪 Testing

```bash
# Make sure backend is running on port 8000
cd backend
python tests/test_full_flow.py
```

---

## 🛠️ Utility Scripts

| Script | Purpose |
|--------|---------|
| `check_prerequisites.py` | Verify all required software is installed |
| `backend/init_db.py` | Create database tables |
| `backend/check_db.py` | Verify database connection and table status |
| `backend/generate_secret_key.py` | Generate secure SECRET_KEY |

---

## 📁 Project Structure

```
job-platform/
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── core/         # Config, database, security
│   │   ├── models/       # SQLAlchemy models
│   │   └── services/     # Business logic
│   ├── tests/            # Integration tests
│   ├── .env              # Environment variables
│   ├── requirements.txt  # Python dependencies
│   ├── init_db.py        # Database initialization
│   ├── check_db.py       # Database checker
│   └── generate_secret_key.py
├── frontend/
│   ├── src/
│   │   ├── api/          # API client
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   └── pages/        # Page components
│   ├── package.json
│   └── vite.config.js
├── check_prerequisites.py
├── SETUP_GUIDE.md
└── README.md
```

---

## 🚀 API Endpoints

Backend runs on: http://localhost:8000

- **Docs**: http://localhost:8000/docs
- **Auth**: `/api/auth/*` - Register, login, OTP
- **Candidates**: `/api/candidates/*` - Profile, resume, proofs
- **Companies**: `/api/companies/*` - Profile, candidates
- **Jobs**: `/api/jobs/*` - Create, list, view
- **Tests**: `/api/tests/*` - Start, submit
- **Scoring**: `/api/scoring/*` - Calculate scores

---

## 🔐 Security Notes

- Generate strong SECRET_KEY: `python backend/generate_secret_key.py`
- Never commit .env file to version control
- Use different keys for dev/staging/production
- For Gmail, use App Password (not regular password)

---

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check if PostgreSQL is running
# Windows: Services → postgresql-x64-15

# Test connection
psql -U postgres -d jobify_db
```

### Import Errors
```bash
pip install -r backend/requirements.txt --force-reinstall
```

### Port Already in Use
```bash
# Find process using port 8000
netstat -ano | findstr :8000

# Kill process (Windows)
taskkill /PID <PID> /F
```

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for more troubleshooting tips.

---

## 📞 Support

- Run `python check_prerequisites.py` to diagnose issues
- Check API docs at http://localhost:8000/docs
- Review logs in terminal output

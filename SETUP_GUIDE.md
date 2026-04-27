# 🚀 Jobify - Complete Setup Guide

## Prerequisites

### Required Software
- **Python 3.10+** ✅ (You have 3.11.9)
- **Node.js 18+** ✅ (You have 24.14.0)
- **PostgreSQL 14+** ❌ (Needs installation)
- **Tesseract OCR** (Optional - for certificate validation)

---

## Step 1: Install PostgreSQL

### Windows (Recommended)
1. Download from: https://www.postgresql.org/download/windows/
2. Run installer (use default port 5432)
3. Set password for `postgres` user (remember this!)
4. Add to PATH: `C:\Program Files\PostgreSQL\15\bin`

### Verify Installation
```bash
psql --version
# Should show: psql (PostgreSQL) 15.x
```

### Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE jobify_db;

# Exit
\q
```

---

## Step 2: Install Tesseract OCR (Optional)

### Windows
1. Download from: https://github.com/UB-Mannheim/tesseract/wiki
2. Install to: `C:\Program Files\Tesseract-OCR`
3. The app will auto-detect this path

### Mac
```bash
brew install tesseract
```

### Linux
```bash
sudo apt-get install tesseract-ocr
```

---

## Step 3: Backend Setup

### 1. Activate Virtual Environment
```bash
cd job-platform
source venv/Scripts/activate  # Git Bash
# OR
venv\Scripts\activate.bat      # CMD
# OR
venv\Scripts\Activate.ps1      # PowerShell
```

### 2. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

**New dependencies added:**
- `pymupdf==1.24.0` - Advanced PDF parsing
- `fastapi-mail==1.4.1` - Email service

### 3. Configure Environment
Edit `backend/.env`:
```env
# Update with your PostgreSQL password
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/jobify_db

# Generate a secure key (run: openssl rand -hex 32)
SECRET_KEY=your-generated-secret-key-here

# Tesseract path (optional - auto-detects if not set)
TESSERACT_PATH=C:\Program Files\Tesseract-OCR\tesseract.exe
```

### 4. Initialize Database
```bash
# Check database connection
python check_db.py

# Create all tables
python init_db.py
```

You should see:
```
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

### 5. Start Backend Server
```bash
uvicorn app.main:app --reload --port 8000
```

Visit: http://localhost:8000/docs for API documentation

---

## Step 4: Frontend Setup

### 1. Install Dependencies
```bash
cd ../frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:5173

---

## 🎉 You're Ready!

### Test the Application

1. **Register as Candidate**
   - Go to http://localhost:5173/register
   - Select "Candidate" role
   - Check email for OTP (or see console for dev_otp)

2. **Verify Email**
   - Enter OTP code
   - Login with credentials

3. **Complete Profile**
   - Fill in your details
   - Upload resume (PDF)
   - Upload proof documents or take skill tests

4. **Register as Company**
   - Register with "Company" role
   - Create company profile
   - Post a job

5. **View Matched Candidates**
   - System automatically scores candidates
   - Only verified candidates with score ≥ 3.5 appear

---

## 🔧 Troubleshooting

### Database Connection Failed
```bash
# Check if PostgreSQL is running
# Windows: Services → postgresql-x64-15
# Mac: brew services list
# Linux: sudo systemctl status postgresql

# Test connection manually
psql -U postgres -d jobify_db
```

### Import Errors
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Port Already in Use
```bash
# Backend (8000)
# Windows: netstat -ano | findstr :8000
# Mac/Linux: lsof -i :8000

# Frontend (5173)
# Change port in vite.config.js
```

### Tesseract Not Found
```bash
# Option 1: Set path in .env
TESSERACT_PATH=C:\Program Files\Tesseract-OCR\tesseract.exe

# Option 2: Add to system PATH
# Option 3: Skip OCR (proofs will be pending manual review)
```

### Email Not Sending
- Check MAIL_USERNAME and MAIL_PASSWORD in .env
- For Gmail, use App Password (not regular password)
- Enable 2FA and generate app password at: https://myaccount.google.com/apppasswords
- If email fails, dev_otp will be shown in API response

---

## 📊 System Flow

```
Candidate Registers
       ↓
Upload Resume → AI parses (education, skills, experience)
       ↓
For each claim → Upload Proof OR select "No Proof"
       ↓
If No Proof → Skill Test assigned (tech/marketing/finance/general)
       ↓
Pass Test (≥60%) → Claim verified → Status: Test Verified
Upload Proof → OCR validates name match → Status: Verified
       ↓
Company posts Job → System scores all verified candidates
       ↓
Score ≥ 3.5 AND Verified → Candidate visible in Company Dashboard
```

---

## 🎯 Scoring Breakdown (out of 5)

| Parameter           | Weight |
|---------------------|--------|
| Skills Match        | 40%    |
| Experience          | 20%    |
| Test Performance    | 20%    |
| Education Relevance | 10%    |
| Profile Completeness| 10%    |

**Visibility Rule:** Score ≥ 3.5 AND Status = Verified/Test Verified

---

## 🧪 Run Tests

```bash
cd backend

# Make sure backend is running on port 8000
# In another terminal:
python tests/test_full_flow.py
```

---

## 📝 What's Fixed

✅ Added missing dependencies (pymupdf, fastapi-mail)
✅ Fixed hardcoded candidate_id in TakeTest.jsx
✅ Made Tesseract path configurable via environment variable
✅ Created database initialization scripts
✅ Added database connection checker
✅ Updated documentation

---

## 🚀 Next Steps

1. **Security**: Generate strong SECRET_KEY
2. **Production**: Set up Docker containers
3. **Features**: Add profile editing, job management
4. **Testing**: Run full integration tests

---

## 📞 Need Help?

- Check API docs: http://localhost:8000/docs
- Review logs in terminal
- Run `python check_db.py` to diagnose database issues

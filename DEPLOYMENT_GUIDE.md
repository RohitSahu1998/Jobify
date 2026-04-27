# 🚀 Deployment Guide - Free Hosting Options

## ⭐ OPTION 1: Render.com (RECOMMENDED)

### Why Render?
- ✅ Easiest deployment
- ✅ Free PostgreSQL (90 days)
- ✅ Auto-deploy from GitHub
- ✅ HTTPS included
- ✅ No credit card required

### Step-by-Step Deployment:

#### 1. Prepare Your Code

**A. Create .gitignore (if not exists)**
```bash
# In job-platform folder, create .gitignore
```

Add this content:
```
venv/
__pycache__/
*.pyc
.env
node_modules/
dist/
build/
uploads/
*.log
.DS_Store
```

**B. Update frontend API URL**

Edit `frontend/vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
```

**C. Update frontend API client**

Edit `frontend/src/api/client.js`:
```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
})

// Rest of the file stays the same...
```

#### 2. Push to GitHub

```bash
cd job-platform
git init
git add .
git commit -m "Initial commit - Jobify platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/jobify.git
git push -u origin main
```

#### 3. Deploy on Render

1. **Sign up:** https://render.com (use GitHub login)

2. **Create PostgreSQL Database:**
   - Click "New +"
   - Select "PostgreSQL"
   - Name: `jobify-db`
   - Database: `jobify_db`
   - User: `jobify_user`
   - Region: Oregon (US West)
   - Plan: Free
   - Click "Create Database"
   - **Copy the Internal Database URL** (you'll need this)

3. **Deploy Backend:**
   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repo
   - Name: `jobify-backend`
   - Region: Oregon
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Plan: Free
   
   **Environment Variables:**
   - `DATABASE_URL`: [Paste Internal Database URL from step 2]
   - `SECRET_KEY`: [Generate with: `python -c "import secrets; print(secrets.token_hex(32))"`]
   - `ALGORITHM`: `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: `1440`
   - `UPLOAD_DIR`: `/tmp/uploads`
   - `MAIL_USERNAME`: `your-email@gmail.com`
   - `MAIL_PASSWORD`: `your-app-password`
   - `MAIL_FROM`: `your-email@gmail.com`
   - `MAIL_SERVER`: `smtp.gmail.com`
   - `MAIL_PORT`: `587`
   - `TESSERACT_PATH`: `/usr/bin/tesseract`
   
   - Click "Create Web Service"
   - Wait for deployment (5-10 min)
   - **Copy the backend URL** (e.g., https://jobify-backend.onrender.com)

4. **Initialize Database:**
   - Go to backend service
   - Click "Shell" tab
   - Run: `python init_db.py`

5. **Deploy Frontend:**
   - Click "New +"
   - Select "Static Site"
   - Connect same GitHub repo
   - Name: `jobify-frontend`
   - Branch: `main`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   
   **Environment Variables:**
   - `VITE_API_URL`: [Paste backend URL from step 3]
   
   - Click "Create Static Site"
   - Wait for deployment (3-5 min)

6. **Update Backend CORS:**
   
   In `backend/app/main.py`, update CORS origins:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[
           "http://localhost:5173",
           "https://jobify-frontend.onrender.com",  # Add your frontend URL
       ],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```
   
   Commit and push:
   ```bash
   git add .
   git commit -m "Update CORS for production"
   git push
   ```

7. **Done!** 🎉
   - Frontend: https://jobify-frontend.onrender.com
   - Backend: https://jobify-backend.onrender.com
   - API Docs: https://jobify-backend.onrender.com/docs

---

## 🔥 OPTION 2: Railway.app

### Why Railway?
- ✅ $5 free credit/month
- ✅ PostgreSQL included
- ✅ Very easy deployment
- ✅ Better performance than Render

### Deployment:

1. **Sign up:** https://railway.app (GitHub login)

2. **New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repo

3. **Add PostgreSQL:**
   - Click "New"
   - Select "Database"
   - Choose "PostgreSQL"

4. **Configure Backend:**
   - Click on your service
   - Settings → Root Directory: `backend`
   - Settings → Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Variables → Add all environment variables
   - Connect PostgreSQL (Railway does this automatically)

5. **Configure Frontend:**
   - Add new service from same repo
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s dist -p $PORT`

6. **Generate Domains:**
   - Click "Generate Domain" for both services

---

## 🌐 OPTION 3: Vercel (Frontend) + Render (Backend)

### Best for: Fastest frontend, separate backend

**Frontend on Vercel (FREE):**
1. Sign up: https://vercel.com
2. Import GitHub repo
3. Root Directory: `frontend`
4. Framework: Vite
5. Environment: `VITE_API_URL` = your backend URL
6. Deploy!

**Backend on Render:**
- Follow Render backend steps above

---

## 🐳 OPTION 4: Fly.io

### Why Fly.io?
- ✅ Free tier: 3 VMs, 3GB storage
- ✅ PostgreSQL included
- ✅ Better for production

### Deployment:

1. **Install Fly CLI:**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   ```

2. **Login:**
   ```bash
   fly auth login
   ```

3. **Deploy Backend:**
   ```bash
   cd backend
   fly launch
   # Follow prompts
   ```

4. **Deploy Frontend:**
   ```bash
   cd frontend
   fly launch
   # Follow prompts
   ```

---

## 📊 Comparison Table

| Platform | Backend | Frontend | Database | Free Tier | Best For |
|----------|---------|----------|----------|-----------|----------|
| **Render** | ✅ | ✅ | ✅ (90 days) | 750 hrs/mo | Easiest, all-in-one |
| **Railway** | ✅ | ✅ | ✅ | $5/month credit | Better performance |
| **Vercel + Render** | ✅ | ✅ | ✅ (90 days) | Unlimited | Fastest frontend |
| **Fly.io** | ✅ | ✅ | ✅ | 3 VMs | Production-ready |
| **Heroku** | ✅ | ✅ | ❌ (paid) | 1000 hrs/mo | Legacy option |

---

## 🎯 My Recommendation

**For Your Job Platform:**

1. **Best Overall:** Render.com
   - Easiest setup
   - Everything in one place
   - Good free tier

2. **Best Performance:** Railway.app
   - Faster than Render
   - $5 credit lasts long
   - Better uptime

3. **Best for Portfolio:** Vercel (Frontend) + Render (Backend)
   - Fastest frontend loading
   - Professional URLs
   - Great for showcasing

---

## ⚠️ Important Notes

### Free Tier Limitations:

**Render:**
- Apps sleep after 15 min inactivity
- Takes ~30 sec to wake up
- PostgreSQL free for 90 days only

**Railway:**
- $5 credit/month
- Runs out if you use too much
- No sleep time

**Vercel:**
- Frontend only
- Need separate backend
- Unlimited bandwidth

### Production Checklist:

- [ ] Generate strong SECRET_KEY
- [ ] Set up proper email (Gmail App Password)
- [ ] Update CORS origins
- [ ] Set up environment variables
- [ ] Initialize database
- [ ] Test all features
- [ ] Set up monitoring
- [ ] Configure custom domain (optional)

---

## 🚀 Quick Start (Render)

```bash
# 1. Prepare code
cd job-platform
git init
git add .
git commit -m "Initial commit"

# 2. Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/jobify.git
git push -u origin main

# 3. Go to render.com
# 4. Create PostgreSQL database
# 5. Deploy backend (connect GitHub)
# 6. Deploy frontend (connect GitHub)
# 7. Done!
```

---

## 📞 Need Help?

- Render Docs: https://render.com/docs
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Fly.io Docs: https://fly.io/docs

---

## 🎉 After Deployment

Your app will be live at:
- Frontend: https://your-app.onrender.com
- Backend: https://your-api.onrender.com
- API Docs: https://your-api.onrender.com/docs

Share the frontend URL with anyone! 🚀

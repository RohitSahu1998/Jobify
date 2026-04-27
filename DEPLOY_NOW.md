# 🚀 DEPLOY YOUR APP NOW - FREE!

## ⭐ EASIEST: Render.com (5 Minutes)

### Step 1: Push to GitHub

```bash
cd D:\Mayank\job-platform

# Initialize git
git init
git add .
git commit -m "Initial commit - Jobify platform"

# Create repo on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/jobify.git
git push -u origin main
```

### Step 2: Deploy on Render

1. **Go to:** https://render.com
2. **Sign up** with GitHub (free, no credit card)

3. **Create Database:**
   - Click "New +" → "PostgreSQL"
   - Name: `jobify-db`
   - Plan: **Free**
   - Click "Create Database"
   - **Copy the "Internal Database URL"** (starts with `postgresql://`)

4. **Deploy Backend:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Name: `jobify-backend`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Plan: **Free**
   
   **Add Environment Variables:**
   ```
   DATABASE_URL = [paste the Internal Database URL from step 3]
   SECRET_KEY = [run: python -c "import secrets; print(secrets.token_hex(32))"]
   ALGORITHM = HS256
   ACCESS_TOKEN_EXPIRE_MINUTES = 1440
   UPLOAD_DIR = /tmp/uploads
   MAIL_USERNAME = jobify0426@gmail.com
   MAIL_PASSWORD = udkyemxinuogpnaq
   MAIL_FROM = jobify0426@gmail.com
   MAIL_SERVER = smtp.gmail.com
   MAIL_PORT = 587
   TESSERACT_PATH = /usr/bin/tesseract
   ```
   
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - **Copy your backend URL** (e.g., `https://jobify-backend.onrender.com`)

5. **Initialize Database:**
   - Go to your backend service
   - Click "Shell" tab
   - Run: `python init_db.py`
   - You should see "✅ Database initialized successfully!"

6. **Deploy Frontend:**
   - Click "New +" → "Static Site"
   - Connect same GitHub repo
   - Name: `jobify-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   
   **Add Environment Variable:**
   ```
   VITE_API_URL = [paste your backend URL from step 4]
   ```
   
   - Click "Create Static Site"
   - Wait 3-5 minutes

7. **Update CORS (Important!):**
   
   Edit `backend/app/main.py` on your computer:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[
           "http://localhost:5173",
           "https://YOUR-FRONTEND-URL.onrender.com",  # Add this!
       ],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```
   
   Then push:
   ```bash
   git add .
   git commit -m "Update CORS for production"
   git push
   ```

8. **Done! 🎉**
   - Your app is live at: `https://jobify-frontend.onrender.com`
   - API docs at: `https://jobify-backend.onrender.com/docs`

---

## 🔥 ALTERNATIVE: Railway.app (Better Performance)

### Why Railway?
- ✅ $5 free credit/month
- ✅ No sleep time (unlike Render)
- ✅ Faster deployment
- ✅ PostgreSQL included

### Deploy:

1. **Go to:** https://railway.app
2. **Sign up** with GitHub
3. **New Project** → "Deploy from GitHub repo"
4. **Add PostgreSQL:** Click "New" → "Database" → "PostgreSQL"
5. **Configure:**
   - Backend root: `backend`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Add environment variables
6. **Generate domains** for both services
7. **Done!**

---

## 🌐 ALTERNATIVE: Vercel (Frontend) + Render (Backend)

### Why This Combo?
- ✅ Fastest frontend (Vercel CDN)
- ✅ Professional URLs
- ✅ Best for portfolios

### Deploy:

**Frontend on Vercel:**
1. Go to: https://vercel.com
2. Import GitHub repo
3. Root Directory: `frontend`
4. Framework: Vite
5. Environment: `VITE_API_URL` = your backend URL
6. Deploy!

**Backend on Render:**
- Follow Render backend steps above

---

## 📊 Quick Comparison

| Platform | Setup Time | Performance | Free Tier | Best For |
|----------|------------|-------------|-----------|----------|
| **Render** | 5 min | Good | 750 hrs/mo | Easiest |
| **Railway** | 3 min | Excellent | $5/month | Best overall |
| **Vercel + Render** | 7 min | Excellent | Unlimited | Portfolio |

---

## ⚠️ Important Notes

### Free Tier Limits:

**Render:**
- Apps sleep after 15 min of no activity
- Takes ~30 seconds to wake up
- PostgreSQL free for 90 days, then $7/month

**Railway:**
- $5 credit/month
- No sleep time
- Credit resets monthly

**Vercel:**
- Unlimited for frontend
- Need separate backend

### After Deployment:

✅ Your app is live 24/7
✅ HTTPS/SSL included
✅ Auto-deploy on git push
✅ Can add custom domain
✅ Share with anyone!

---

## 🎯 My Recommendation

**For Your Job Platform:**

1. **Start with Render** - Easiest, everything in one place
2. **Upgrade to Railway** - If you need better performance
3. **Use Vercel + Render** - If you want fastest frontend

---

## 🚀 Quick Deploy (Copy-Paste)

```bash
# 1. Push to GitHub
cd D:\Mayank\job-platform
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/jobify.git
git push -u origin main

# 2. Go to render.com
# 3. Sign up with GitHub
# 4. Click "New +" → "PostgreSQL" (Free)
# 5. Click "New +" → "Web Service" (Backend)
# 6. Click "New +" → "Static Site" (Frontend)
# 7. Add environment variables
# 8. Done!
```

---

## 📞 Need Help?

- Render Tutorial: https://render.com/docs/deploy-fastapi
- Railway Tutorial: https://docs.railway.app/getting-started
- Vercel Tutorial: https://vercel.com/docs

---

## 🎉 After Deployment

Share your live app:
- Frontend: `https://your-app.onrender.com`
- API Docs: `https://your-api.onrender.com/docs`

Add to your resume/portfolio! 🚀

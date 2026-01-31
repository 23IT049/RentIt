# 🚀 Deployment Guide - Rental Management System

## Quick Deployment (Free Tier)

### Prerequisites
- GitHub account
- Vercel account (for frontend)
- Render/Railway account (for backend)
- MongoDB Atlas (already set up)

---

## 📦 Backend Deployment (Render)

### 1. Prepare Backend for Deployment

Create `render.yaml` in server directory:
```yaml
services:
  - type: web
    name: rental-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: CLIENT_URL
        sync: false
```

### 2. Deploy to Render

1. Push code to GitHub
2. Go to https://render.com
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Select the `server` directory
6. Configure:
   - **Name:** rental-backend
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
7. Add environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Your secret key
   - `CLIENT_URL`: Your Vercel frontend URL (add after frontend deployment)
8. Click "Create Web Service"
9. Wait for deployment (5-10 minutes)
10. Copy the deployment URL (e.g., https://rental-backend.onrender.com)

---

## 🎨 Frontend Deployment (Vercel)

### 1. Update API URL

Update `client/.env`:
```env
VITE_API_URL=https://rental-backend.onrender.com/api
```

### 2. Deploy to Vercel

**Option A: Vercel CLI**
```bash
cd client
npm install -g vercel
vercel login
vercel
```

**Option B: Vercel Dashboard**
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** client
   - **Build Command:** `npm run build`
   - **Output Directory:** dist
5. Add environment variable:
   - `VITE_API_URL`: https://rental-backend.onrender.com/api
6. Click "Deploy"
7. Wait for deployment (2-3 minutes)
8. Copy the deployment URL (e.g., https://rental-app.vercel.app)

### 3. Update Backend CORS

Go back to Render dashboard:
1. Open your backend service
2. Update `CLIENT_URL` environment variable to your Vercel URL
3. Redeploy the service

---

## 🧪 Test Deployment

1. Visit your Vercel URL
2. Register a new account
3. Create an item
4. Book an item
5. Verify all features work

---

## 🔧 Alternative: Railway Deployment

### Backend on Railway

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables
5. Railway will auto-detect Node.js and deploy

---

## 📝 Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] CORS configured correctly
- [ ] MongoDB connection working
- [ ] User registration works
- [ ] Item creation works
- [ ] Booking creation works
- [ ] All pages load correctly

---

## 🐛 Common Issues

### CORS Error
- Ensure `CLIENT_URL` in backend matches your Vercel URL exactly
- No trailing slash in URLs

### MongoDB Connection Error
- Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access
- Verify connection string is correct

### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check build logs for specific errors

---

## 💰 Cost Breakdown (Free Tier)

- **MongoDB Atlas:** Free (512MB)
- **Render:** Free (750 hours/month)
- **Vercel:** Free (100GB bandwidth)

**Total:** $0/month for MVP! 🎉

---

## 🚀 Production Optimizations (Future)

1. **Add Redis caching**
2. **Enable CDN for images**
3. **Add rate limiting**
4. **Enable compression**
5. **Add monitoring (Sentry)**
6. **Set up CI/CD pipeline**
7. **Add automated backups**

---

## 📞 Support

If deployment fails, check:
1. Build logs in Render/Vercel
2. Environment variables are set
3. MongoDB Atlas network access
4. CORS configuration

---

**Deployment Time:** ~20-30 minutes total

# Deployment Guide

This guide covers deploying the Noor SuperApp to production environments.

## Overview

The Noor SuperApp consists of three main components:
1. **Frontend (Next.js)** → Vercel
2. **Backend (Node.js/Express)** → Render
3. **Database (MongoDB)** → MongoDB Atlas
4. **Mobile (React Native)** → App Store & Google Play

---

## Prerequisites

- Git repository (GitHub recommended)
- Vercel account
- Render account
- MongoDB Atlas account
- Domain name (optional)
- Stripe, PayPal accounts for payments
- OpenAI API key

---

## 1. Database Setup (MongoDB Atlas)

### Step 1: Create Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new cluster (Free tier available)
4. Choose cloud provider (AWS recommended)
5. Select region closest to your users

### Step 2: Configure Database Access

1. Go to "Database Access"
2. Add a new database user
3. Set username and password (save these securely)
4. Grant "Read and write to any database" permissions

### Step 3: Configure Network Access

1. Go to "Network Access"
2. Add IP Address
3. Choose "Allow access from anywhere" (0.0.0.0/0) for development
4. For production, whitelist specific IPs

### Step 4: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `myFirstDatabase` with your database name (e.g., `noor-superapp`)

**Example:**
```
mongodb+srv://noorapp:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/noor-superapp?retryWrites=true&w=majority
```

---

## 2. Backend Deployment (Render)

### Step 1: Prepare Backend

1. Ensure `server/package.json` has start script:
```json
{
  "scripts": {
    "start": "node src/app.js"
  }
}
```

2. Create `render.yaml` in project root:
```yaml
services:
  - type: web
    name: noor-superapp-api
    env: node
    region: oregon
    plan: free
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGO_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: PORT
        value: 5000
```

### Step 2: Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your Git repository
4. Configure:
   - **Name**: noor-superapp-api
   - **Environment**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free (or paid for production)

### Step 3: Set Environment Variables

Add these environment variables in Render:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=30d
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=https://noorapp.net
ALADHAN_API_URL=https://api.aladhan.com/v1
```

### Step 4: Verify Deployment

1. Wait for deployment to complete
2. Note the deployment URL (e.g., `https://noor-superapp-api.onrender.com`)
3. Test health endpoint: `https://your-api.onrender.com/health`

---

## 3. Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. Update `client/.env.production`:
```env
NEXT_PUBLIC_API_URL=https://your-render-api.onrender.com/api
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Navigate to client directory:
```bash
cd client
```

3. Deploy:
```bash
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Set Environment Variables

Add in Vercel project settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://noor-superapp-api.onrender.com/api
NEXT_PUBLIC_OPENAI_API_KEY=...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

### Step 4: Configure Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `noorapp.net`)
3. Configure DNS records as instructed
4. Wait for DNS propagation (up to 24 hours)

### Step 5: Verify Deployment

1. Visit your Vercel URL or custom domain
2. Test functionality:
   - Homepage loads
   - Authentication works
   - API calls succeed
   - i18n language switching works

---

## 4. Mobile App Deployment

### iOS Deployment (App Store)

#### Prerequisites
- Apple Developer Account ($99/year)
- Mac with Xcode installed
- iOS device for testing

#### Steps

1. **Configure App**
```bash
cd mobile
```

2. **Update `app.json`**:
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.noorapp.superapp",
      "buildNumber": "1.0.0"
    }
  }
}
```

3. **Build for iOS**:
```bash
expo build:ios
```

4. **Submit to App Store**:
   - Download IPA file from Expo
   - Upload to App Store Connect using Transporter
   - Fill in app metadata
   - Submit for review

### Android Deployment (Google Play)

#### Prerequisites
- Google Play Developer Account ($25 one-time)

#### Steps

1. **Configure App**:
```json
{
  "expo": {
    "android": {
      "package": "com.noorapp.superapp",
      "versionCode": 1
    }
  }
}
```

2. **Build for Android**:
```bash
expo build:android
```

3. **Submit to Google Play**:
   - Download APK/AAB from Expo
   - Upload to Google Play Console
   - Create app listing
   - Submit for review

---

## 5. SSL/TLS Configuration

### Vercel (Frontend)
- Automatically provisions SSL certificates
- No configuration needed

### Render (Backend)
- Automatically provisions SSL certificates
- HTTPS enabled by default

### Custom Domain
- Ensure DNS records point to Vercel/Render
- SSL certificates auto-renewed

---

## 6. CI/CD Pipeline (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./client

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

---

## 7. Monitoring and Analytics

### Application Monitoring

1. **Vercel Analytics**
   - Automatically enabled
   - View in Vercel dashboard

2. **Render Monitoring**
   - View logs in Render dashboard
   - Set up alerts

3. **Sentry (Error Tracking)**
```bash
npm install @sentry/react @sentry/node
```

Configure in `client/src/pages/_app.tsx` and `server/src/app.js`

### Database Monitoring

1. **MongoDB Atlas**
   - Go to "Metrics" tab
   - Monitor connections, operations, storage
   - Set up alerts for high usage

---

## 8. Backup Strategy

### Database Backups

1. **MongoDB Atlas Automatic Backups**
   - Enabled on M10+ clusters
   - Continuous backups
   - Point-in-time recovery

2. **Manual Backups**
```bash
mongodump --uri="mongodb+srv://..." --out=./backup
```

### Code Backups
- Git version control
- Regular commits to GitHub
- Tag releases

---

## 9. Environment Management

### Development
```
Frontend: http://localhost:3000
Backend: http://localhost:5000
Database: Local MongoDB or Atlas
```

### Staging (Optional)
```
Frontend: https://staging.noorapp.net
Backend: https://staging-api.noorapp.net
Database: Separate Atlas cluster
```

### Production
```
Frontend: https://noorapp.net
Backend: https://api.noorapp.net
Database: Production Atlas cluster
```

---

## 10. Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database seeded with initial data
- [ ] SSL certificates active
- [ ] Custom domain configured
- [ ] API endpoints responding correctly
- [ ] Authentication working
- [ ] Payment processing functional
- [ ] Email notifications working
- [ ] Mobile apps submitted
- [ ] Monitoring and alerts set up
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Team notified of deployment

---

## 11. Scaling Considerations

### Frontend Scaling
- Vercel auto-scales
- CDN for static assets
- Image optimization

### Backend Scaling
- Upgrade Render plan for more resources
- Implement caching (Redis)
- Load balancing
- Database connection pooling

### Database Scaling
- Upgrade to M10+ cluster
- Enable sharding for horizontal scaling
- Create indexes for frequently queried fields

---

## 12. Troubleshooting

### Common Issues

**Frontend not connecting to backend**
- Check `NEXT_PUBLIC_API_URL` environment variable
- Verify CORS settings in backend
- Check browser console for errors

**Database connection errors**
- Verify MongoDB connection string
- Check network access whitelist
- Ensure database user has correct permissions

**Build failures**
- Check build logs in Vercel/Render
- Verify all dependencies are in `package.json`
- Ensure Node version compatibility

**Mobile build errors**
- Clear Expo cache: `expo start -c`
- Update Expo SDK: `expo upgrade`
- Check `app.json` configuration

---

## 13. Support and Resources

- **Documentation**: https://docs.noorapp.net
- **API Status**: https://status.noorapp.net
- **GitHub Issues**: https://github.com/noorapp/superapp/issues
- **Discord Community**: https://discord.gg/noorapp
- **Email Support**: support@noorapp.net

---

**Deployment Date**: October 7, 2025
**Last Updated**: October 7, 2025
**Maintained By**: Noor SuperApp DevOps Team

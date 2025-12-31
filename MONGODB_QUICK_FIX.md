# MongoDB Connection Fix - Quick Guide

## The Problem
Your app is trying to connect to MongoDB at `localhost:27017`, but MongoDB isn't running on your computer.

**Error:** `connect ECONNREFUSED 127.0.0.1:27017`

---

## ✅ SOLUTION 1: MongoDB Atlas (Recommended - 10 minutes)

**Free cloud database - no installation needed!**

### Step 1: Create Free Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google
3. Choose **FREE M0 Cluster** (0.5GB storage, perfect for development)
4. Select a cloud provider & region closest to you (AWS/us-east-1 is fine)
5. Name your cluster (e.g., "noor-cluster")
6. Click **Create Cluster** (takes 3-5 minutes to provision)

### Step 2: Create Database User
1. In Atlas dashboard, click **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Username: `noor_admin` (or whatever you prefer)
5. Password: Generate a strong password (save it!)
6. Database User Privileges: **Read and write to any database**
7. Click **Add User**

### Step 3: Whitelist Your IP
1. Click **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (for development)
   - Or add your specific IP for better security
4. Click **Confirm**

### Step 4: Get Connection String
1. Go to **Database** → Click **Connect** on your cluster
2. Choose **Connect your application**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://noor_admin:<password>@noor-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 5: Update Your .env File
1. Open `server/.env`
2. Find the `MONGO_URI` and `MONGODB_URI` lines
3. Replace `<username>` with your database username (e.g., `noor_admin`)
4. Replace `<password>` with your actual password
5. Replace `<cluster>` with your cluster name (e.g., `noor-cluster.xxxxx`)
6. Add `/NoorSuperApp` before the `?` to specify the database name

**Example:**
```env
MONGO_URI=mongodb+srv://noor_admin:MySecurePassword123@noor-cluster.ab1cd.mongodb.net/NoorSuperApp?retryWrites=true&w=majority
MONGODB_URI=mongodb+srv://noor_admin:MySecurePassword123@noor-cluster.ab1cd.mongodb.net/NoorSuperApp?retryWrites=true&w=majority
```

### Step 6: Test Connection
```powershell
cd server
node src/scripts/import-meta-tafsir.js
```

Expected output:
```
✅ Connected to MongoDB
✅ Imported Surah metadata: 114
```

---

## 🔧 SOLUTION 2: Local MongoDB (Requires Installation)

**If you prefer to run MongoDB on your computer:**

### Windows Installation
1. Download MongoDB Community Server:
   - https://www.mongodb.com/try/download/community
   - Version: Current release
   - Package: MSI

2. Run installer:
   - Choose **Complete** installation
   - Install as **Windows Service** ✅
   - Service Name: MongoDB
   - Data Directory: `C:\Program Files\MongoDB\Server\7.0\data`
   - Log Directory: `C:\Program Files\MongoDB\Server\7.0\log`

3. Start MongoDB Service:
   ```powershell
   net start MongoDB
   ```

4. Verify it's running:
   ```powershell
   mongosh --eval "db.version()"
   ```

5. Update `server/.env`:
   ```env
   MONGO_URI=mongodb://localhost:27017/NoorSuperApp
   MONGODB_URI=mongodb://localhost:27017/NoorSuperApp
   ```

### macOS Installation
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu/Debian)
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

---

## ⚡ After MongoDB is Connected

### 1. Import Initial Data
```powershell
cd server
node src/scripts/import-meta-tafsir.js
```

### 2. Start the Application
```powershell
# Terminal 1 - Backend
cd server
pnpm dev

# Terminal 2 - Frontend  
cd client
pnpm dev
```

### 3. Open Your App
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/health

---

## 🚨 Troubleshooting

### "Authentication failed" (Atlas)
- Double-check username/password in connection string
- Make sure password doesn't contain special characters like `@`, `:`, `/` (URL encode them)
- Verify user has "Read and write to any database" permissions

### "IP not whitelisted" (Atlas)
- Go to Network Access → Add IP Address → Allow Access from Anywhere
- Wait 1-2 minutes for changes to propagate

### "Service not found" (Local)
- MongoDB didn't install as service
- Try manual start: `"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\Program Files\MongoDB\Server\7.0\data"`

### Still having issues?
1. Check MongoDB logs (Atlas: Metrics tab, Local: `C:\Program Files\MongoDB\Server\7.0\log\mongod.log`)
2. Test connection with mongosh: `mongosh "your-connection-string"`
3. Verify `.env` file has no extra spaces or quotes around the connection string

---

## 📝 Current Status

**Database Name:** `NoorSuperApp` (updated from `noor-superapp`)

**What's Ready:**
- ✅ All Phase 1, 2, and 3 code complete
- ✅ Surah metadata file ready to import
- ✅ Import scripts ready
- ⏳ Just need MongoDB connection!

**Next Steps After MongoDB:**
1. Import metadata (30 seconds)
2. Start servers (30 seconds)
3. Your app is running! 🎉

---

## 💡 Recommendation

**Use MongoDB Atlas** - It's:
- ✅ Free forever (M0 tier)
- ✅ No installation needed
- ✅ Automatic backups
- ✅ Built-in monitoring
- ✅ Works from anywhere
- ✅ Required for Vector Search (Hadith AI feature later)

Local MongoDB is great for offline development, but Atlas is simpler to get started.

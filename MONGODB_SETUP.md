# 🚨 MongoDB Setup Required

## Issue Detected

The import script failed because **MongoDB is not running**. You have two options:

---

## ✅ Option 1: Use MongoDB Atlas (Recommended - Free & Cloud)

### Step 1: Create Free Atlas Account

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google/Email
3. Choose **FREE** tier (M0 Sandbox)

### Step 2: Create Cluster

1. After signup, click "Build a Database"
2. Choose **FREE** tier (Shared - M0)
3. Cloud Provider: **AWS**
4. Region: Choose closest to you
5. Cluster Name: `noor-cluster`
6. Click "Create Cluster" (takes 3-5 minutes)

### Step 3: Create Database User

1. Go to "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Authentication Method: **Password**
4. Username: `noor-admin`
5. Password: Generate secure password (save it!)
6. Database User Privileges: **Read and write to any database**
7. Click "Add User"

### Step 4: Allow Network Access

1. Go to "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
   - IP Address: `0.0.0.0/0`
   - Description: "Development Access"
4. Click "Confirm"

### Step 5: Get Connection String

1. Go to "Database" (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Drivers"
4. Copy the connection string (looks like):
   ```
   mongodb+srv://noor-admin:<password>@noor-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password

### Step 6: Update .env File

Open `server/.env` and update:

```bash
# Replace this line:
MONGO_URI=mongodb://localhost:27017/noor-superapp

# With your Atlas connection string:
MONGO_URI=mongodb+srv://noor-admin:YOUR_PASSWORD@noor-cluster.xxxxx.mongodb.net/noor_db?retryWrites=true&w=majority
```

**Important**: Replace `YOUR_PASSWORD` and the cluster URL with your actual values!

### Step 7: Test Connection

```bash
cd server
node src/scripts/import-meta-tafsir.js
```

Expected output:
```
✅ Connected to MongoDB
✅ Imported Surah metadata: 114
⚠️  Missing data/tafsir_jalalayn_en_ar.json (optional)
🎉 Import complete!
```

---

## ⚙️ Option 2: Install Local MongoDB (Alternative)

### Windows Installation:

1. **Download MongoDB Community Server**:
   - Go to: https://www.mongodb.com/try/download/community
   - Version: Latest (7.0+)
   - Platform: Windows
   - Package: MSI
   - Click "Download"

2. **Install MongoDB**:
   - Run the downloaded `.msi` file
   - Choose "Complete" installation
   - Install MongoDB as a Service: ✅ YES
   - Install MongoDB Compass: ✅ YES (GUI tool)
   - Click "Install"

3. **Verify Installation**:
   ```powershell
   mongod --version
   ```
   Should show version info

4. **Start MongoDB Service**:
   ```powershell
   net start MongoDB
   ```

5. **Test Connection**:
   ```bash
   cd server
   node src/scripts/import-meta-tafsir.js
   ```

---

## 🎯 Recommended: Use MongoDB Atlas

**Why Atlas?**
- ✅ Free tier available (512MB storage)
- ✅ No installation required
- ✅ Cloud backup included
- ✅ Vector search included (for AI features)
- ✅ Works from anywhere
- ✅ No local service management

**Why NOT Local?**
- ❌ Requires installation
- ❌ Service management needed
- ❌ Vector search requires Enterprise version ($$$)
- ❌ Manual backups
- ❌ Only works on this computer

---

## 🔧 After MongoDB Setup

Once MongoDB is connected, run:

```bash
cd server

# Import surah metadata
node src/scripts/import-meta-tafsir.js

# Then start the server
pnpm dev
```

---

## 📊 MongoDB Atlas Dashboard Features

After setup, you can:

1. **Browse Data**: See imported surahs, users, donations
2. **Create Indexes**: Required for vector search (AI features)
3. **Monitor Performance**: Query times, storage usage
4. **Manage Users**: Add/remove database users
5. **Backup Data**: Automatic cloud backups

---

## 🆘 Troubleshooting

### Error: "bad auth: Authentication failed"
- Check username and password in connection string
- Ensure user has "Read and write" privileges

### Error: "not authorized on admin to execute command"
- User needs "readWriteAnyDatabase" role
- Go to Database Access → Edit User → Update privileges

### Error: "connection timed out"
- Check Network Access → Ensure IP is whitelisted
- Try "Allow Access from Anywhere" for testing

### Error: "ECONNREFUSED"
- MongoDB service not running (if using local)
- Check connection string format
- Verify network connectivity

---

## ✅ Next Steps After MongoDB Setup

1. ✅ Import surah metadata: `node src/scripts/import-meta-tafsir.js`
2. ✅ Start server: `pnpm dev`
3. ⬜ Configure OAuth (see SETUP_GUIDE.md)
4. ⬜ Configure email (see SETUP_GUIDE.md)
5. ⬜ Create vector indexes (see SETUP_GUIDE.md)

---

**Choose Option 1 (Atlas) for fastest setup!** ☁️

Let me know once MongoDB is connected and I'll help with the next steps!

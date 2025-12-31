# Quick Start Guide

Welcome to the Noor SuperApp development! This guide will help you set up and run the project locally.

## 🚀 Prerequisites

Before you begin, ensure you have installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 (comes with Node.js)
- **MongoDB** (local or Atlas account)
- **Git** ([Download](https://git-scm.com/))
- **Code Editor** (VS Code recommended)

Optional but recommended:
- **MongoDB Compass** (GUI for MongoDB)
- **Postman** (API testing)

---

## 📥 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/noor-superapp.git
cd noor-superapp
```

### 2. Install Dependencies

Install dependencies for all workspaces:

```bash
npm run install:all
```

Or install individually:

```bash
# Root dependencies
npm install

# Frontend dependencies
cd client
npm install

# Backend dependencies
cd ../server
npm install

# Mobile dependencies (optional for web-only development)
cd ../mobile
npm install
```

---

## ⚙️ Configuration

### Backend Configuration

1. Create `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

2. Edit `server/.env` with your configuration:

```env
# Environment
NODE_ENV=development
PORT=5000

# Database - Choose one:
# Local MongoDB
MONGO_URI=mongodb://localhost:27017/noor-superapp

# OR MongoDB Atlas
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/noor-superapp

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=30d

# OpenAI API Key (get from https://platform.openai.com/)
OPENAI_API_KEY=sk-your_openai_api_key_here

# Payment Gateways (optional for development)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
PAYPAL_CLIENT_ID=your_paypal_client_id

# External APIs
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
ALADHAN_API_URL=https://api.aladhan.com/v1

# Frontend URL
CLIENT_URL=http://localhost:3000
```

### Frontend Configuration

1. Create `.env.local` file in the `client` directory:

```bash
cd ../client
cp .env.example .env.local
```

2. Edit `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

---

## 🗄️ Database Setup

### Option 1: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service:

**Windows:**
```powershell
net start MongoDB
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
```

3. Create database:
```bash
mongosh
use noor-superapp
```

### Option 2: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (or allow all: 0.0.0.0/0 for development)
5. Get connection string and update `MONGO_URI` in `.env`

### Seed Initial Data (Optional)

```bash
cd server
npm run seed
```

---

## 🏃 Running the Application

### Run Everything (Recommended)

Open **3 separate terminal windows**:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Server runs on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
Frontend runs on: http://localhost:3000

**Terminal 3 - Mobile (Optional):**
```bash
cd mobile
npm start
```

### Or Use Root Scripts

From the project root:

```bash
# Development mode
npm run dev:server    # Terminal 1
npm run dev:client    # Terminal 2
npm run dev:mobile    # Terminal 3
```

---

## ✅ Verify Installation

### 1. Check Backend Health

Open browser or use curl:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Noor SuperApp API is running"
}
```

### 2. Check Frontend

Open browser: http://localhost:3000

You should see the Noor SuperApp homepage.

### 3. Test API Endpoints

**Register a user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get Quran Surahs:**
```bash
curl http://localhost:5000/api/quran/surahs
```

---

## 📱 Mobile Development

### Using Expo Go (Easiest)

1. Install Expo Go app on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Start the mobile app:
```bash
cd mobile
npm start
```

3. Scan QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

### Using Simulator/Emulator

**iOS Simulator (macOS only):**
```bash
npm run ios
```

**Android Emulator:**
```bash
npm run android
```

---

## 🛠️ Development Tools

### VS Code Extensions (Recommended)

1. **ESLint** - JavaScript linting
2. **Prettier** - Code formatting
3. **Tailwind CSS IntelliSense** - Tailwind autocomplete
4. **MongoDB for VS Code** - Database GUI
5. **Thunder Client** - API testing (like Postman)
6. **React Native Tools** - Mobile development

### MongoDB Compass

1. Download: https://www.mongodb.com/try/download/compass
2. Connect to: `mongodb://localhost:27017`
3. Select database: `noor-superapp`

### API Testing with Postman

1. Import collection: `docs/postman_collection.json` (if available)
2. Set environment variable: `API_URL=http://localhost:5000/api`

---

## 📚 Project Structure Overview

```
noor-superapp/
├── client/              # Next.js frontend
│   ├── src/
│   │   ├── pages/       # Next.js pages (routes)
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts
│   │   ├── styles/      # CSS/Tailwind styles
│   │   └── i18n/        # Translations
│   └── public/          # Static assets
│
├── server/              # Express backend
│   ├── src/
│   │   ├── models/      # Mongoose models
│   │   ├── controllers/ # Route controllers
│   │   ├── routes/      # API routes
│   │   ├── middlewares/ # Custom middleware
│   │   └── app.js       # Main app file
│   └── .env             # Environment variables
│
├── mobile/              # React Native app
│   ├── src/
│   │   ├── screens/     # App screens
│   │   ├── navigation/  # Navigation setup
│   │   ├── components/  # React Native components
│   │   └── contexts/    # React contexts
│   └── App.tsx          # Root component
│
├── docs/                # Documentation
│   ├── API_DOCS.md      # API documentation
│   ├── ROADMAP.md       # Development roadmap
│   ├── DEPLOYMENT.md    # Deployment guide
│   └── DESIGN_GUIDE.md  # Design system
│
└── README.md            # Main documentation
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Backend (Port 5000):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

**Frontend (Port 3000):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### MongoDB Connection Issues

1. Check if MongoDB is running:
```bash
mongosh
```

2. Verify connection string in `.env`
3. For Atlas: Check IP whitelist

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or for specific workspace
cd client
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

**Clear Next.js cache:**
```bash
cd client
rm -rf .next
npm run dev
```

**Clear Expo cache:**
```bash
cd mobile
npx expo start -c
```

### TypeScript Errors

The project will show TypeScript errors until dependencies are installed. This is normal. Run:
```bash
npm run install:all
```

---

## 🔐 Getting API Keys

### OpenAI API Key
1. Go to: https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create new secret key
5. Add to `.env` files

### Stripe API Keys
1. Go to: https://dashboard.stripe.com/
2. Sign up or log in
3. Get test keys from Developers → API keys
4. Add both public and secret keys

### Google Maps API Key
1. Go to: https://console.cloud.google.com/
2. Create a new project
3. Enable Maps JavaScript API
4. Create credentials → API key
5. Add to `.env` files

---

## 📖 Next Steps

1. **Read the Documentation**
   - [API Documentation](./docs/API_DOCS.md)
   - [Roadmap](./docs/ROADMAP.md)
   - [Design Guidelines](./docs/DESIGN_GUIDE.md)

2. **Start Development**
   - Create a new branch: `git checkout -b feature/your-feature`
   - Make changes
   - Test thoroughly
   - Commit: `git commit -m "Add feature"`
   - Push: `git push origin feature/your-feature`

3. **Join the Community**
   - Discord: https://discord.gg/noorapp
   - GitHub Discussions: https://github.com/noorapp/superapp/discussions

---

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

---

## 📞 Support

- **Email**: support@noorapp.net
- **Discord**: https://discord.gg/noorapp
- **GitHub Issues**: https://github.com/noorapp/superapp/issues
- **Documentation**: https://docs.noorapp.net

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Happy Coding! May your development be blessed. 🤲**

---

**Last Updated**: October 7, 2025

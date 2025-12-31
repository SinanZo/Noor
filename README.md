# 🕌 نور – Noor SuperApp

**Your Companion in Faith, Knowledge & Life**

A comprehensive multilingual Islamic SuperApp combining all Islamic digital services in one unified platform.

## 🌟 Features

### Core Modules

- **QuranHub** - Quran reader with translations, Tafsir, and AI-powered search
- **Hadith Navigator** - Authentic Hadith collections with cross-references
- **PrayerTime360** - Location-based prayer times with Qibla compass
- **MuslimLife Planner** - Daily ibadah tracker with habit streaks
- **IslamVerse (AI Assistant)** - AI chatbot trained on Quran & Hadith
- **SadaqahChain** - Transparent donation and Zakat system
- **LearnArabicQuranic** - Gamified Arabic and Tajweed lessons
- **Islamic Kids World** - Games, stories, and Quran for children
- **HalalFinder** - Global halal restaurants and products guide
- **UmmahConnect** - Muslim social network and job board

## 🛠️ Technology Stack

### Frontend
- **Web**: Next.js 14, Tailwind CSS, i18next, Framer Motion
- **Mobile**: React Native, React Navigation

### Backend
- **Server**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, OAuth (Google, Apple, Facebook)
- **AI**: OpenAI API (fine-tuned with Islamic datasets)

### Payments & Services
- Stripe, HyperPay, PayPal
- Blockchain (optional for transparency)

### Hosting
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

## 🌍 Multilingual Support

- Arabic (RTL) - العربية
- English
- Urdu (RTL) - اردو
- French - Français

## 📁 Project Structure

```
noor-superapp/
├── client/          # Next.js web frontend
├── server/          # Node.js/Express backend
├── mobile/          # React Native mobile app
└── docs/            # Documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB instance (local or Atlas)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/noor-superapp.git
cd noor-superapp
```

2. Install all dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
```bash
# Copy .env.example to .env in client and server directories
cp client/.env.example client/.env
cp server/.env.example server/.env
```

4. Start development servers:

```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:client

# Terminal 3 - Mobile (optional)
npm run dev:mobile
```

## 📖 Documentation

- [API Documentation](./docs/API_DOCS.md)
- [Development Roadmap](./docs/ROADMAP.md)
- [Design Guidelines](./docs/DESIGN_GUIDE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🎨 Design System

### Color Palette
- **Emerald Green**: `#009688` - Primary accent
- **Gold**: `#FFD700` - Secondary accent
- **Cream White**: `#F5F5DC` - Backgrounds
- **Charcoal Black**: `#36454F` - Text

### Typography
- **Arabic**: Tajawal
- **English**: Poppins

## 💰 Monetization

- Freemium model with premium subscriptions
- Donation system with transparent tracking
- Ethical sponsorships and halal brand partnerships
- Subscription tiers: Gold, Scholar, Family

## 🗺️ Development Roadmap

- **Phase 1**: QuranHub + PrayerTime360 + Donation (Q1 2025)
- **Phase 2**: AI Assistant + Life Planner (Q2 2025)
- **Phase 3**: HalalFinder + Kids World (Q3 2025)
- **Phase 4**: Hadith Navigator + LearnArabic (Q4 2025)
- **Phase 5**: Community & Social Features (Q1 2026)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) first.

## 📧 Contact

- Website: [noorapp.net](https://noorapp.net)
- Email: support@noorapp.net
- Twitter: [@NoorSuperApp](https://twitter.com/NoorSuperApp)

---

**Made with ❤️ for the Muslim Ummah**

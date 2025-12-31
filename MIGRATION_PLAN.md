# 🔄 Migration Plan: Restructure to Modern Monorepo

## 📋 Overview
Migrating from current structure to professional monorepo with:
- **Turborepo** for build caching and task orchestration
- **TypeScript** throughout with ES modules
- **Next.js 14 App Router** with next-intl for i18n
- **Proper separation**: apps/ and packages/
- **Modern APIs**: Quran, Prayer (adhan), Donations (Stripe)

---

## 🎯 Target Structure

```
noor-superapp/
├── apps/
│   ├── web/                    # Next.js 14 App Router + next-intl
│   │   ├── app/
│   │   │   ├── [locale]/
│   │   │   │   ├── page.tsx           # Home
│   │   │   │   ├── quran/page.tsx     # QuranHub
│   │   │   │   ├── prayer/page.tsx    # PrayerTime360
│   │   │   │   └── donate/page.tsx    # Donations
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── messages/
│   │   │   ├── en.json
│   │   │   └── ar.json
│   │   ├── middleware.ts         # next-intl locale detection
│   │   ├── i18n/request.ts
│   │   ├── tailwind.config.ts
│   │   ├── next.config.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── server/                  # Express + TypeScript + ES modules
│       ├── src/
│       │   ├── index.ts              # Main entry
│       │   ├── models/
│       │   │   ├── QuranAyah.ts
│       │   │   ├── DonationProject.ts
│       │   │   └── DonationPayment.ts
│       │   ├── controllers/
│       │   │   ├── quran.controller.ts
│       │   │   ├── prayer.controller.ts
│       │   │   └── donation.controller.ts
│       │   ├── routes/
│       │   │   ├── quran.routes.ts
│       │   │   ├── prayer.routes.ts
│       │   │   └── donation.routes.ts
│       │   └── seed/
│       │       └── seed.ts           # Seed Al-Fatiha + projects
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   └── shared/                  # Shared types
│       ├── src/
│       │   └── types.ts
│       └── package.json
│
├── turbo.json                   # Turborepo config
├── pnpm-workspace.yaml
├── package.json                 # Root with turbo scripts
├── .gitignore
└── README.md
```

---

## ⚠️ Breaking Changes

### 1. Frontend Migration
**From**: Next.js Pages Router (`pages/`)
**To**: Next.js App Router (`app/[locale]/`)

**Impact**:
- All pages must be rewritten
- `getStaticProps` → Server Components
- `useTranslation` (next-i18next) → `useTranslations` (next-intl)
- File structure completely changes

### 2. Backend Migration
**From**: CommonJS JavaScript
**To**: ES Modules TypeScript

**Impact**:
- All `.js` files become `.ts`
- `require()` → `import/export`
- `module.exports` → `export default`
- Type annotations required

### 3. Folder Structure
**From**: `client/`, `server/`, `mobile/` at root
**To**: `apps/web/`, `apps/server/`, `packages/shared/`

**Impact**:
- All import paths change
- Environment files move
- Build scripts update

---

## 📦 New Dependencies

### apps/web (Frontend)
```json
{
  "next": "14.2.5",           // Already on 14.2.33 ✅
  "next-intl": "^3.14.0",     // NEW - replaces next-i18next
  "lucide-react": "^0.446.0", // NEW - replaces @heroicons/react
  "clsx": "^2.1.1"            // NEW - class name utility
}
```

**Remove**: `next-i18next`, `@heroicons/react`

### apps/server (Backend)
```json
{
  "express": "^4.19.2",
  "mongoose": "^8.5.0",
  "stripe": "^16.0.0",        // NEW
  "adhan": "^4.4.2",          // NEW - prayer times
  "jsonwebtoken": "^9.0.2",
  "zod": "^3.23.8",           // NEW - validation
  "typescript": "^5.5.4",     // NEW
  "ts-node": "^10.9.2",       // NEW
  "nodemon": "^3.1.4"
}
```

---

## 🔄 Migration Steps

### Phase 1: Prepare (No Downtime)
1. ✅ Stop current dev servers
2. ✅ Commit/backup current working code
3. ✅ Create new folder structure
4. ✅ Update root config files

### Phase 2: Backend Migration
1. Create `apps/server/` with TypeScript setup
2. Convert models to TypeScript
3. Implement new controllers (Quran, Prayer, Donations)
4. Set up seed script
5. Test API endpoints

### Phase 3: Frontend Migration
1. Create `apps/web/` with App Router
2. Set up next-intl with [locale] routing
3. Create new pages (Home, Quran, Prayer, Donate)
4. Implement RTL support
5. Test all pages

### Phase 4: Integration & Testing
1. Connect frontend to new backend
2. Test Quran reading
3. Test Prayer times with geolocation
4. Test Donation flow
5. Test i18n switching (EN ↔ AR)

### Phase 5: Cleanup
1. Remove old `client/` folder
2. Remove old `server/` folder
3. Update documentation
4. Final testing

---

## 🚨 Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Complete rewrite** | HIGH | Keep old code as backup |
| **All features break** | HIGH | Rebuild incrementally |
| **Learning curve** | MEDIUM | Provide examples for each feature |
| **Time investment** | MEDIUM | ~2-3 hours for full migration |
| **Data loss** | LOW | No database changes needed |

---

## ✅ What We Keep

- ✅ MongoDB models (just convert to TS)
- ✅ Environment variables (same values)
- ✅ Tailwind CSS (same theme)
- ✅ Design system (colors, fonts)
- ✅ Core logic (auth, APIs)

## 🆕 What We Gain

- ✅ Turborepo build caching (faster builds)
- ✅ TypeScript safety (fewer bugs)
- ✅ Next.js App Router (better performance)
- ✅ next-intl (simpler i18n)
- ✅ Modern architecture (easier to scale)
- ✅ ES modules (modern JavaScript)
- ✅ Proper monorepo (shared code)
- ✅ Prayer times with `adhan` (accurate calculations)
- ✅ Donation system with Stripe (production-ready)

---

## 🎓 Key Differences to Learn

### 1. next-intl vs next-i18next

**Old (next-i18next)**:
```tsx
import { useTranslation } from 'next-i18next';
const { t } = useTranslation('common');
<h1>{t('title')}</h1>
```

**New (next-intl)**:
```tsx
import { useTranslations } from 'next-intl';
const t = useTranslations('home');
<h1>{t('title')}</h1>
```

### 2. Pages Router vs App Router

**Old (Pages)**:
```
pages/
├── index.tsx              → http://localhost:3000/
├── quran/index.tsx        → http://localhost:3000/quran
└── _app.tsx
```

**New (App Router)**:
```
app/
├── [locale]/
│   ├── page.tsx           → http://localhost:3000/en or /ar
│   └── quran/page.tsx     → http://localhost:3000/en/quran
└── layout.tsx
```

### 3. CommonJS vs ES Modules

**Old (CommonJS)**:
```javascript
const express = require('express');
module.exports = router;
```

**New (ES Modules)**:
```typescript
import express from 'express';
export default router;
```

---

## 📊 Estimated Timeline

| Phase | Duration | Complexity |
|-------|----------|------------|
| **Preparation** | 15 min | Low |
| **Backend Migration** | 45 min | Medium |
| **Frontend Migration** | 60 min | High |
| **Integration & Testing** | 30 min | Medium |
| **Cleanup** | 15 min | Low |
| **TOTAL** | ~2.5 hours | Medium-High |

---

## 🤔 Decision Required

**Do you want to proceed with this migration?**

### Option A: Full Migration (Recommended)
- Modern architecture
- Production-ready
- Follows spec exactly
- ~2.5 hours work

### Option B: Incremental Migration
- Keep current structure
- Add new features gradually
- Less risky but less clean
- Won't match spec

### Option C: Hybrid Approach
- Migrate backend to TypeScript
- Keep Pages Router for now
- Faster but mixed architecture

---

## 📝 Before We Start Checklist

- [ ] All current work committed/backed up
- [ ] MongoDB Atlas connection string ready
- [ ] Stripe test API keys ready
- [ ] ~3 hours available for migration
- [ ] Understanding of breaking changes
- [ ] Ready for complete restructure

---

**Recommendation**: Go with **Option A (Full Migration)** since:
1. You're early in development
2. Spec is clear and professional
3. Foundation will be solid for scaling
4. Modern stack is easier to maintain

**Next Step**: Should I proceed with the full migration?


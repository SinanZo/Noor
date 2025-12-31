# Phase 3 Implementation Guide — JWT Auth + Quran SEO + AI RAG

## ✅ COMPLETED (Phase 3.1 — Authentication)

### Server-Side Authentication ✅
- **Dependencies installed**: bcryptjs, cookie-parser, express-rate-limit, jsonwebtoken
- **User model updated**: Added `name`, `locale`, `role`, `avatar` fields, `comparePassword()` method
- **Auth middleware**: Created `signToken()`, `protect()`, `restrictTo()` functions
- **Auth controller**: Updated with Phase 3 compatible `register`, `login`, `me`, `updateMe` endpoints
- **Auth routes**: Configured with `/api/auth` and `/api/v1/auth` (backward compatible)
- **Planner secured**: Controller uses `req.user.id`, routes protected with `protect` middleware
- **Environment**: Added `JWT_EXPIRES_IN`, `OPENAI_EMBEDDINGS_MODEL` to server/.env
- **API versioning**: All routes available at both `/api/` and `/api/v1/` paths

### Client-Side Authentication ✅
- **Zustand installed**: State management library for auth
- **Auth store**: `client/src/lib/auth.ts` with persisted token & user
- **API helper**: `client/src/lib/api.ts` with automatic token injection & 401 handling
- **Login page**: `client/src/pages/auth/login.tsx` with email/password form
- **Register page**: `client/src/pages/auth/register.tsx` with full name, locale selection
- **Profile page**: `client/src/pages/profile.tsx` with name/locale editing, logout
- **Environment**: Added `NEXT_PUBLIC_API_BASE` to client/.env.local

---

## 🔨 TODO (Phase 3.2 — Remaining Features)

### 1. Update Planner Page with JWT (CRITICAL)

**File**: `client/src/pages/planner/index.tsx`

**Changes needed**:
```typescript
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

// Inside component:
const { token, isAuthenticated } = useAuth();
const router = useRouter();

useEffect(() => {
  if (!isAuthenticated()) {
    router.push('/auth/login');
  }
}, [isAuthenticated, router]);

// Replace axios calls with api instance (already has token):
const fetchHabits = async () => {
  const response = await api.get('/planner/habits');
  // ...
};

const saveTarget = async (key: string, targetPerDay: number) => {
  await api.post('/planner/habits', { key, targetPerDay });
};

const logActivity = async (key: string) => {
  await api.post('/planner/log', { key, value: 1 });
};

const fetchStats = async () => {
  const response = await api.get('/planner/stats', {
    params: { from, to }
  });
  // ...
};
```

**Remove**: All `x-user` headers (no longer needed)

---

### 2. Add Navigation with Auth Links

**File**: Create `client/src/components/Header.tsx` (or update existing navigation)

```typescript
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth';

export default function Header() {
  const { user, clear, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    clear();
    router.push('/auth/login');
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">
          Noor
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/quran" className="hover:text-primary">Quran</Link>
          <Link href="/prayer" className="hover:text-primary">Prayer</Link>
          <Link href="/ai" className="hover:text-primary">AI</Link>
          <Link href="/planner" className="hover:text-primary">Planner</Link>
          
          {!isAuthenticated() ? (
            <>
              <Link href="/auth/login" className="hover:text-primary">Login</Link>
              <Link 
                href="/auth/register"
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link href="/profile" className="hover:text-primary">
                {user?.name || 'Profile'}
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
```

**Add to**: `client/src/pages/_app.tsx` layout

---

### 3. Structured Quran Routes with SEO

**Note**: Your client uses Pages Router, not App Router. The user spec was for App Router.
For Pages Router, we need a different approach:

**File**: `client/src/pages/quran/[surah].tsx`

```typescript
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface Ayah {
  ayah: number;
  text_ar: string;
  text_en: string;
}

interface SurahPageProps {
  surah: number;
  ayat: Ayah[];
}

export default function SurahPage({ surah, ayat }: SurahPageProps) {
  const router = useRouter();
  const locale = router.locale || 'en';
  
  const title = locale === 'ar' 
    ? `القرآن الكريم — سورة ${surah}` 
    : `Quran — Surah ${surah}`;
    
  const description = locale === 'ar'
    ? `قراءة سورة ${surah} مترجمة مع التلاوة والتفسير.`
    : `Read Surah ${surah} with translation and recitation.`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <link rel="canonical" href={`/${locale}/quran/${surah}`} />
      </Head>

      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">
          {locale === 'ar' ? `سورة ${surah}` : `Surah ${surah}`}
        </h1>
        
        <div className="space-y-6">
          {ayat.map((ayah) => (
            <article key={ayah.ayah} className="bg-white rounded-xl border p-6">
              <div 
                className="text-right text-2xl leading-loose font-semibold mb-4"
                dir="rtl"
              >
                {ayah.text_ar}
              </div>
              
              {ayah.text_en && (
                <div className="text-gray-700 text-lg">
                  {ayah.text_en}
                </div>
              )}
              
              <div className="mt-3 text-sm text-gray-500">
                {locale === 'ar' ? 'آية' : 'Ayah'} {ayah.ayah}
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  const paths = [];
  
  for (let surah = 1; surah <= 114; surah++) {
    for (const locale of locales || ['en', 'ar']) {
      paths.push({
        params: { surah: String(surah) },
        locale,
      });
    }
  }

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const surah = Number(params?.surah);
  
  // Fetch Quran data from API
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api/v1';
  const res = await fetch(`${apiBase}/quran/surah/${surah}`);
  
  if (!res.ok) {
    return { notFound: true };
  }
  
  const data = await res.json();
  
  return {
    props: {
      surah,
      ayat: data.data?.ayat || data.ayat || [],
    },
    revalidate: 3600, // Revalidate every hour
  };
};
```

**Update**: `client/src/pages/quran/index.tsx` to add surah links:

```typescript
<div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2">
  {Array.from({ length: 114 }, (_, i) => i + 1).map((surah) => (
    <Link
      key={surah}
      href={`/quran/${surah}`}
      className="bg-primary/10 hover:bg-primary hover:text-white text-center py-4 rounded-lg font-semibold transition"
    >
      {surah}
    </Link>
  ))}
</div>
```

---

### 4. Sitemap & Robots.txt

**File**: `client/public/sitemap.xml` (generate manually or with script)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  
  <url>
    <loc>https://noor-app.com/en</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="https://noor-app.com/ar"/>
  </url>
  
  <url>
    <loc>https://noor-app.com/en/quran</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Generate for all 114 surahs in both locales -->
  <url>
    <loc>https://noor-app.com/en/quran/1</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="https://noor-app.com/ar/quran/1"/>
  </url>
  
  <!-- ... repeat for surah 2-114 ... -->
  
</urlset>
```

**File**: `client/public/robots.txt`

```
User-agent: *
Allow: /

Sitemap: https://noor-app.com/sitemap.xml
```

**File**: `client/next.config.js` — Add i18n config if not present:

```javascript
module.exports = {
  i18n: {
    locales: ['en', 'ar'],
    defaultLocale: 'en',
  },
  // ...existing config
};
```

---

### 5. QuranEmbedding Model (MongoDB + OpenAI)

**File**: `server/src/models/QuranEmbedding.js`

```javascript
const mongoose = require('mongoose');

const QuranEmbeddingSchema = new mongoose.Schema({
  surah: {
    type: Number,
    required: true,
    min: 1,
    max: 114,
    index: true,
  },
  ayah: {
    type: Number,
    required: true,
    min: 1,
    index: true,
  },
  text: {
    type: String,
    required: true,
  },
  embedding: {
    type: [Number],
    required: true,
    // For MongoDB Atlas Vector Search
  },
}, {
  timestamps: true,
});

// Compound unique index
QuranEmbeddingSchema.index({ surah: 1, ayah: 1 }, { unique: true });

module.exports = mongoose.model('QuranEmbedding', QuranEmbeddingSchema, 'quran_embeddings');
```

---

### 6. Build Embeddings Script

**File**: `server/src/scripts/build-quran-embeddings.js`

```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const OpenAI = require('openai');
const QuranAyah = require('../models/QuranAyah');
const QuranEmbedding = require('../models/QuranEmbedding');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function embedTexts(texts) {
  const model = process.env.OPENAI_EMBEDDINGS_MODEL || 'text-embedding-3-large';
  const response = await openai.embeddings.create({
    model,
    input: texts,
  });
  return response.data.map(item => item.embedding);
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const ayat = await QuranAyah.find().lean();
  console.log(`📖 Found ${ayat.length} ayat`);

  const batchSize = 50;
  let processed = 0;

  for (let i = 0; i < ayat.length; i += batchSize) {
    const batch = ayat.slice(i, i + batchSize);
    
    const texts = batch.map(ayah => 
      `${ayah.text_ar}\n${ayah.text_en || ''}`.trim()
    );

    console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}...`);
    const embeddings = await embedTexts(texts);

    for (let j = 0; j < batch.length; j++) {
      const ayah = batch[j];
      await QuranEmbedding.findOneAndUpdate(
        { surah: ayah.surah, ayah: ayah.ayah },
        {
          $set: {
            text: texts[j],
            embedding: embeddings[j],
          },
        },
        { upsert: true }
      );
    }

    processed += batch.length;
    console.log(`✅ Processed ${processed}/${ayat.length}`);
  }

  console.log('🎉 Embeddings build complete!');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
```

**Add script to**: `server/package.json`

```json
"scripts": {
  "embeddings:quran": "node src/scripts/build-quran-embeddings.js"
}
```

**Run**:
```bash
cd server
pnpm embeddings:quran
```

---

### 7. MongoDB Atlas Vector Index Setup

**Atlas UI Steps**:
1. Go to MongoDB Atlas → Your Cluster → Search tab
2. Click "Create Search Index"
3. Choose "JSON Editor"
4. Index name: `quran_embeddings_index`
5. Database: `noor-superapp`
6. Collection: `quran_embeddings`
7. Definition:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 3072,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "surah"
    },
    {
      "type": "filter",
      "path": "ayah"
    }
  ]
}
```

**Note**: For `text-embedding-3-large`, use `numDimensions: 3072`. For `text-embedding-3-small`, use `1536`.

---

### 8. AI Controller with Vector Search RAG

**File**: `server/src/controllers/aiController.js` (replace existing)

```javascript
const QuranEmbedding = require('../models/QuranEmbedding');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function embedQuery(text) {
  const model = process.env.OPENAI_EMBEDDINGS_MODEL || 'text-embedding-3-large';
  const response = await openai.embeddings.create({
    model,
    input: text,
  });
  return response.data[0].embedding;
}

exports.askAI = async (req, res) => {
  try {
    const question = String(req.body.q || '').trim();
    
    if (!question) {
      return res.status(400).json({ error: 'Empty question' });
    }

    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return res.json({
        answer: `Mock response: "${question}"\n\nTo enable AI features, configure OPENAI_API_KEY in server/.env`,
        references: []
      });
    }

    // 1. Generate embedding for user question
    const queryVector = await embedQuery(question);

    // 2. MongoDB Vector Search
    const vectorResults = await QuranEmbedding.aggregate([
      {
        $vectorSearch: {
          index: 'quran_embeddings_index',
          path: 'embedding',
          queryVector: queryVector,
          numCandidates: 200,
          limit: 8,
        },
      },
      {
        $project: {
          surah: 1,
          ayah: 1,
          text: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ]);

    // 3. Build context from retrieved ayat
    const context = vectorResults
      .map(r => `(${r.surah}:${r.ayah}) ${r.text}`)
      .join('\n\n');

    // 4. System prompt
    const systemPrompt = `You are an Islamic assistant. Use only authentic sources (Quran provided). Provide concise, respectful answers. Include ayah references like (2:255). Avoid issuing fatwas; if needed, advise consulting a scholar. Distinguish opinions from facts.`;

    // 5. User prompt with context
    const userPrompt = `Question:\n${question}\n\nRelevant Quran excerpts:\n${context || 'None'}\n\nAnswer in the user's language (Arabic if Arabic input detected). Cite ayat clearly.`;

    // 6. OpenAI completion
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 1000,
    });

    const answer = completion.choices[0]?.message?.content || '';

    res.json({
      answer,
      references: vectorResults.map(r => ({
        surah: r.surah,
        ayah: r.ayah,
        score: r.score,
      })),
    });
  } catch (error) {
    console.error('AI error:', error);
    res.status(500).json({ error: error.message });
  }
};
```

---

## 🚀 Testing Phase 3

### 1. Test Authentication
```bash
# Register
POST http://localhost:5000/api/v1/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "locale": "en"
}

# Login
POST http://localhost:5000/api/v1/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}

# Get profile (with token)
GET http://localhost:5000/api/v1/auth/me
Authorization: Bearer <token>

# Update profile
PATCH http://localhost:5000/api/v1/auth/me
Authorization: Bearer <token>
{
  "name": "Updated Name",
  "locale": "ar"
}
```

### 2. Test Planner with JWT
```bash
# Get habits (requires token)
GET http://localhost:5000/api/v1/planner/habits
Authorization: Bearer <token>

# Create habit
POST http://localhost:5000/api/v1/planner/habits
Authorization: Bearer <token>
{
  "key": "salah",
  "targetPerDay": 5
}

# Log activity
POST http://localhost:5000/api/v1/planner/log
Authorization: Bearer <token>
{
  "key": "salah",
  "value": 1
}

# Get stats
GET http://localhost:5000/api/v1/planner/stats?from=2025-10-01&to=2025-10-07
Authorization: Bearer <token>
```

### 3. Test Vector Search AI
```bash
# Ask question (after building embeddings)
POST http://localhost:5000/api/v1/ai/ask
{
  "q": "What does the Quran say about patience?"
}
```

### 4. Test Frontend Auth
1. Navigate to http://localhost:3000/auth/register
2. Create account
3. Check localStorage for `noor-auth-storage`
4. Navigate to http://localhost:3000/profile
5. Update name/locale
6. Logout
7. Login again

### 5. Test Quran SEO Routes
1. Navigate to http://localhost:3000/quran/1
2. Check page title in browser tab
3. View source — verify `<meta>` tags
4. Test both EN and AR locales

---

## 📋 Deployment Checklist

### Environment Variables (Production)
```bash
# Server
JWT_SECRET=<generate-with-openssl-rand-hex-32>
JWT_EXPIRES_IN=7d
MONGO_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDINGS_MODEL=text-embedding-3-large

# Client
NEXT_PUBLIC_API_BASE=https://your-api.com/api/v1
NEXT_PUBLIC_APP_NAME=Noor
```

### Pre-Deploy Steps
1. ✅ Run `pnpm embeddings:quran` (one-time, ~10 min)
2. ✅ Create MongoDB Atlas Vector Index (one-time)
3. ✅ Test all auth endpoints
4. ✅ Test planner with JWT tokens
5. ✅ Test AI with vector search
6. ✅ Build sitemap for production domain
7. ✅ Update CORS origins in server
8. ✅ Set secure cookies (production only)
9. ✅ Enable rate limiting
10. ✅ Test SSR/SSG for Quran pages

---

## 🎯 What's Working Now

### Phase 3.1 Complete ✅
- JWT authentication (register/login/me/updateMe)
- User model with locale & role
- Auth pages (login/register/profile)
- Client auth store with persistence
- API helper with automatic token injection
- Planner secured with JWT
- API versioning (/api and /api/v1)

### Phase 3.2 Remaining 🔨
- Quran dynamic routes with SEO (code provided above)
- Sitemap & robots.txt (code provided above)
- QuranEmbedding model (code provided above)
- Build embeddings script (code provided above)
- Vector Search AI controller (code provided above)
- Update planner page to use auth (code provided above)
- Navigation with auth links (code provided above)

---

## 📚 Additional Resources

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### MongoDB Atlas Vector Search Docs
https://www.mongodb.com/docs/atlas/atlas-vector-search/

### OpenAI Embeddings Pricing
- text-embedding-3-large: $0.00013 / 1K tokens (~$0.82 for full Quran)
- text-embedding-3-small: $0.00002 / 1K tokens (~$0.13 for full Quran)

### Next.js i18n Routing
https://nextjs.org/docs/pages/building-your-application/routing/internationalization

---

## 🔄 Next Steps After Phase 3

1. **Hadith Integration**: Add Hadith corpus with embeddings
2. **Social Auth**: Google/Facebook OAuth
3. **Password Reset**: Email-based flow
4. **Refresh Tokens**: Long-lived sessions
5. **Admin Dashboard**: User management
6. **Analytics**: Track usage patterns
7. **Notifications**: Prayer time reminders
8. **Offline Mode**: Service Worker caching
9. **Mobile App**: React Native sync
10. **Performance**: Redis caching layer

---

## 📞 Support

If you encounter issues:
1. Check server logs: `cd server && pnpm dev`
2. Check client logs: Browser DevTools Console
3. Verify environment variables are set
4. Test API endpoints with Postman/cURL
5. Check MongoDB Atlas is accessible
6. Verify OpenAI API key has credits

**All code is copy-paste ready. Follow the sections above to complete Phase 3!**

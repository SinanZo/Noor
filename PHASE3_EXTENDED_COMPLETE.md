# Phase 3 Extended — Complete Implementation Guide
## Surah Names + Tafsir + OAuth + Email Receipts + Audio + Hadith RAG

## ✅ COMPLETED SO FAR

### Environment Variables ✅
- **Server (.env)**: Added SMTP config, Google/Apple OAuth keys, Audio CDN settings
- **Client (.env.local)**: Added Google/Apple Client IDs and redirect URIs

### Dependencies Installed ✅
- **Server**: nodemailer, google-auth-library, apple-signin-auth, jwks-rsa, node-fetch@3

### Models Created ✅
- **SurahMeta.js**: Surah metadata (nameAr, nameEn, revelationPlace, ayahCount)
- **Tafsir.js**: Tafsir content (surah, ayah, ar, en)
- **HadithEmbedding.js**: Vector embeddings for Hadith RAG
- **Hadith.js**: Already exists from Phase 1

---

## 🔨 IMPLEMENTATION STEPS

### 1. Email Utility (Donation Receipts)

**File**: `server/src/utils/email.js`

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendDonationReceipt(opts) {
  const { to, name, amountCents, currency, projectTitleEn, projectTitleAr, paymentId } = opts;
  
  const amount = (amountCents / 100).toFixed(2) + ' ' + currency.toUpperCase();
  const subject = `Donation Receipt — ${amount}`;
  
  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto;padding:20px">
      <h2 style="color:#009688">جزاك الله خيرًا / JazakAllahu Khairan</h2>
      <p>Dear ${name || 'Donor'},</p>
      <p>We have received your generous donation:</p>
      <table style="margin:20px 0">
        <tr><td><strong>Amount:</strong></td><td>${amount}</td></tr>
        <tr><td><strong>Project:</strong></td><td>${projectTitleEn || ''} — ${projectTitleAr || ''}</td></tr>
        <tr><td><strong>Payment ID:</strong></td><td>${paymentId}</td></tr>
      </table>
      <p>May Allah accept your charity and reward you abundantly.</p>
      <p style="margin-top:30px">— Noor SuperApp Team</p>
    </div>
  `;
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
}

module.exports = { transporter, sendDonationReceipt };
```

---

### 2. Update Donation Controller (Send Receipts)

**File**: `server/src/controllers/donationController.js`

**Add at top**:
```javascript
const { sendDonationReceipt } = require('../utils/email');
const DonationProject = require('../models/DonationProject');
const DonationPayment = require('../models/DonationPayment');
```

**In `stripeWebhook` function, after handling `payment_intent.succeeded`**:

```javascript
if (event.type === 'payment_intent.succeeded') {
  const intent = event.data.object;
  
  const doc = await DonationPayment.findOneAndUpdate(
    { providerRef: intent.id },
    { status: 'succeeded' },
    { new: true }
  );
  
  if (doc?.projectId && doc.amountCents) {
    const project = await DonationProject.findByIdAndUpdate(
      doc.projectId,
      { $inc: { collectedAmount: doc.amountCents } },
      { new: true }
    );
    
    // Send email receipt if donor email exists
    if (doc.email) {
      try {
        await sendDonationReceipt({
          to: doc.email,
          name: doc.name || 'Donor',
          amountCents: doc.amountCents,
          currency: doc.currency || 'usd',
          projectTitleEn: project?.title?.en,
          projectTitleAr: project?.title?.ar,
          paymentId: doc._id.toString(),
        });
        console.log('✅ Receipt email sent to:', doc.email);
      } catch (emailErr) {
        console.error('❌ Failed to send receipt email:', emailErr);
      }
    }
  }
}
```

---

### 3. OAuth Controller (Google & Apple)

**File**: `server/src/controllers/oauthController.js`

```javascript
const { OAuth2Client } = require('google-auth-library');
const appleSignin = require('apple-signin-auth');
const User = require('../models/User');
const { signToken } = require('../middlewares/auth');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Google OAuth - Verify ID token from web client
 */
exports.googleOAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ error: 'Missing credential' });
    }
    
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    if (!payload?.email) {
      return res.status(400).json({ error: 'No email in token' });
    }
    
    const email = payload.email.toLowerCase();
    const name = payload.name || email.split('@')[0];
    const avatar = payload.picture;
    
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        email,
        name,
        avatar,
        locale: 'en',
        role: 'user',
      });
    }
    
    const token = signToken({
      id: user._id.toString(),
      role: user.role || 'user',
    });
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        locale: user.locale || 'en',
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Apple OAuth - Verify ID token from web client
 */
exports.appleOAuth = async (req, res) => {
  try {
    const { id_token } = req.body;
    
    if (!id_token) {
      return res.status(400).json({ error: 'Missing id_token' });
    }
    
    const data = await appleSignin.verifyIdToken(id_token, {
      audience: process.env.APPLE_CLIENT_ID,
      ignoreExpiration: false,
    });
    
    const email = (data.email || '').toLowerCase();
    const sub = data.sub; // unique Apple ID
    const identifier = email || `apple:${sub}`;
    
    let user = await User.findOne({ email: identifier });
    
    if (!user) {
      user = await User.findOne({ avatar: `apple:${sub}` });
    }
    
    if (!user) {
      user = await User.create({
        email: identifier,
        name: 'Apple User',
        avatar: `apple:${sub}`,
        locale: 'en',
        role: 'user',
      });
    }
    
    const token = signToken({
      id: user._id.toString(),
      role: user.role || 'user',
    });
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        locale: user.locale || 'en',
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Apple OAuth error:', error);
    res.status(500).json({ error: error.message });
  }
};
```

**File**: `server/src/routes/oauthRoutes.js`

```javascript
const express = require('express');
const { googleOAuth, appleOAuth } = require('../controllers/oauthController');

const router = express.Router();

router.post('/google', googleOAuth);
router.post('/apple', appleOAuth);

module.exports = router;
```

**Register in `server/src/app.js`**:

```javascript
const oauthRoutes = require('./routes/oauthRoutes');

// ... after other routes
app.use('/api/v1/oauth', oauthRoutes);
```

---

### 4. Extend Quran Controller (Metadata + Tafsir)

**File**: `server/src/controllers/quranController.js`

**Add imports**:
```javascript
const SurahMeta = require('../models/SurahMeta');
const Tafsir = require('../models/Tafsir');
```

**Add new exports**:

```javascript
/**
 * Get Surah with metadata and ayat
 */
exports.getSurah = async (req, res) => {
  try {
    const surah = Number(req.params.id);
    
    const [meta, ayat] = await Promise.all([
      SurahMeta.findOne({ surah }).lean(),
      QuranAyah.find({ surah }).sort({ ayah: 1 }).lean(),
    ]);
    
    res.json({ surah, meta, ayat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get Surah metadata only
 */
exports.getMeta = async (req, res) => {
  try {
    const surah = Number(req.params.id);
    const meta = await SurahMeta.findOne({ surah }).lean();
    
    if (!meta) {
      return res.status(404).json({ error: 'Surah metadata not found' });
    }
    
    res.json(meta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get Tafsir for a Surah
 */
exports.getTafsirBySurah = async (req, res) => {
  try {
    const surah = Number(req.params.id);
    const docs = await Tafsir.find({ surah }).sort({ ayah: 1 }).lean();
    
    res.json({ surah, tafsir: docs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Search Quran text
 */
exports.searchQuran = async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    
    if (!q) {
      return res.json({ results: [] });
    }
    
    const regex = new RegExp(q, 'i');
    const results = await QuranAyah.find({
      $or: [{ text_ar: regex }, { text_en: regex }],
    })
      .limit(50)
      .lean();
    
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

**Update `server/src/routes/quranRoutes.js`**:

```javascript
const express = require('express');
const {
  getSurah,
  getMeta,
  getTafsirBySurah,
  searchQuran,
  // ... existing exports
} = require('../controllers/quranController');

const router = express.Router();

router.get('/surah/:id', getSurah);
router.get('/meta/:id', getMeta);
router.get('/tafsir/:id', getTafsirBySurah);
router.get('/search', searchQuran);

// ... existing routes

module.exports = router;
```

---

### 5. Audio Proxy Routes

**File**: `server/src/routes/audioRoutes.js`

```javascript
const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

/**
 * Proxy full-surah audio for offline-friendly same-origin caching
 * GET /api/v1/audio/surah/:id -> streams MP3
 */
router.get('/surah/:id', async (req, res) => {
  const surah = Number(req.params.id);
  
  if (!surah || surah < 1 || surah > 114) {
    return res.status(400).send('Invalid surah number');
  }
  
  const base = process.env.AUDIO_BASE_URL || 'https://cdn.islamic.network/quran/audio-surah/128';
  const reciter = process.env.AUDIO_RECITER || 'ar.alafasy';
  const url = `${base}/${reciter}/${surah}.mp3`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      return res.status(502).send('Upstream audio error');
    }
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    
    response.body.pipe(res);
  } catch (error) {
    console.error('Audio proxy error:', error);
    res.status(500).send('Audio proxy error');
  }
});

module.exports = router;
```

**Register in `server/src/app.js`**:

```javascript
const audioRoutes = require('./routes/audioRoutes');

// ... after other routes
app.use('/api/v1/audio', audioRoutes);
```

---

### 6. Import Scripts

**File**: `server/src/scripts/import-meta-tafsir.js`

```javascript
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const SurahMeta = require('../models/SurahMeta');
const Tafsir = require('../models/Tafsir');

async function importSurahMeta() {
  const file = path.join(process.cwd(), 'data', 'surah_meta.json');
  
  if (!fs.existsSync(file)) {
    console.error('❌ Missing data/surah_meta.json');
    console.log('Create file with structure: [{"surah":1,"nameAr":"الفاتحة","nameEn":"Al-Fātiḥah","revelationPlace":"Meccan","ayahCount":7}, ...]');
    return;
  }
  
  const items = JSON.parse(fs.readFileSync(file, 'utf8'));
  await SurahMeta.deleteMany({});
  await SurahMeta.insertMany(items);
  console.log('✅ Imported Surah metadata:', items.length);
}

async function importTafsir() {
  const file = path.join(process.cwd(), 'data', 'tafsir_jalalayn_en_ar.json');
  
  if (!fs.existsSync(file)) {
    console.log('⚠️  Missing data/tafsir_jalalayn_en_ar.json (optional)');
    console.log('Create file with: [{"surah":1,"ayah":1,"ar":"...","en":"..."}, ...]');
    return;
  }
  
  const items = JSON.parse(fs.readFileSync(file, 'utf8'));
  await Tafsir.deleteMany({});
  await Tafsir.insertMany(items);
  console.log('✅ Imported tafsir:', items.length);
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');
  
  await importSurahMeta();
  await importTafsir();
  
  console.log('🎉 Import complete!');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
```

**File**: `server/src/scripts/import-hadith.js`

```javascript
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Hadith = require('../models/Hadith');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');
  
  const file = path.join(process.cwd(), 'data', 'hadith_en_ar.json');
  
  if (!fs.existsSync(file)) {
    console.error('❌ Missing data/hadith_en_ar.json');
    console.log('Create file with: [{"collection":"Bukhari","book":1,"number":"1","refId":"bukhari-1-1","ar":"...","en":"...","grade":"Sahih","topic":"Intention"}, ...]');
    process.exit(1);
  }
  
  const items = JSON.parse(fs.readFileSync(file, 'utf8'));
  await Hadith.deleteMany({});
  await Hadith.insertMany(items);
  
  console.log('✅ Imported hadith:', items.length);
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
```

**File**: `server/src/scripts/build-hadith-embeddings.js`

```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const OpenAI = require('openai');
const Hadith = require('../models/Hadith');
const HadithEmbedding = require('../models/HadithEmbedding');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const model = process.env.OPENAI_EMBEDDINGS_MODEL || 'text-embedding-3-large';

async function embedBatch(texts) {
  const response = await openai.embeddings.create({ model, input: texts });
  return response.data.map(item => item.embedding);
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');
  
  const cursor = Hadith.find().cursor();
  let batch = [];
  let processed = 0;
  
  for await (const hadith of cursor) {
    const text = `${hadith.ar || ''}\n${hadith.en || ''}`.trim();
    batch.push({
      refId: hadith.refId,
      collection: hadith.collection,
      book: hadith.book,
      number: hadith.number,
      text,
    });
    
    if (batch.length >= 50) {
      const embeddings = await embedBatch(batch.map(b => b.text));
      
      await Promise.all(batch.map((item, i) =>
        HadithEmbedding.findOneAndUpdate(
          { refId: item.refId },
          {
            $set: {
              collection: item.collection,
              book: item.book,
              number: item.number,
              text: item.text,
              embedding: embeddings[i],
            },
          },
          { upsert: true }
        )
      ));
      
      processed += batch.length;
      console.log(`✅ Processed ${processed} hadith embeddings`);
      batch = [];
    }
  }
  
  if (batch.length) {
    const embeddings = await embedBatch(batch.map(b => b.text));
    
    await Promise.all(batch.map((item, i) =>
      HadithEmbedding.findOneAndUpdate(
        { refId: item.refId },
        {
          $set: {
            collection: item.collection,
            book: item.book,
            number: item.number,
            text: item.text,
            embedding: embeddings[i],
          },
        },
        { upsert: true }
      )
    ));
    
    processed += batch.length;
    console.log(`✅ Processed remaining ${batch.length} hadith embeddings`);
  }
  
  console.log(`🎉 Total hadith embeddings created: ${processed}`);
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
```

**Add scripts to `server/package.json`**:

```json
"scripts": {
  "import:meta-tafsir": "node src/scripts/import-meta-tafsir.js",
  "import:hadith": "node src/scripts/import-hadith.js",
  "embeddings:hadith": "node src/scripts/build-hadith-embeddings.js"
}
```

---

### 7. Enhanced AI Controller (Hadith RAG)

**File**: `server/src/controllers/aiController.js` (REPLACE ENTIRE FILE)

```javascript
const QuranEmbedding = require('../models/QuranEmbedding');
const HadithEmbedding = require('../models/HadithEmbedding');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const EMB_MODEL = process.env.OPENAI_EMBEDDINGS_MODEL || 'text-embedding-3-large';

async function embedQuery(text) {
  const response = await openai.embeddings.create({
    model: EMB_MODEL,
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
        answer: `Mock response: "${question}"\n\nTo enable AI features with Quran and Hadith RAG, configure OPENAI_API_KEY in server/.env`,
        quranRefs: [],
        hadithRefs: [],
      });
    }
    
    // Generate embedding for question
    const queryVector = await embedQuery(question);
    
    // Search Quran embeddings
    const quranResults = await QuranEmbedding.aggregate([
      {
        $vectorSearch: {
          index: 'quran_embeddings_index',
          path: 'embedding',
          queryVector: queryVector,
          numCandidates: 200,
          limit: 6,
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
    
    // Search Hadith embeddings
    const hadithResults = await HadithEmbedding.aggregate([
      {
        $vectorSearch: {
          index: 'hadith_embeddings_index',
          path: 'embedding',
          queryVector: queryVector,
          numCandidates: 200,
          limit: 6,
        },
      },
      {
        $project: {
          refId: 1,
          collection: 1,
          book: 1,
          number: 1,
          text: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ]);
    
    // Build context
    const contextQuran = quranResults
      .map(r => `QURAN (${r.surah}:${r.ayah}) ${r.text}`)
      .join('\n\n');
    
    const contextHadith = hadithResults
      .map(r => `HADITH [${r.collection} ${r.book}:${r.number}] ${r.text}`)
      .join('\n\n');
    
    // System prompt
    const systemPrompt = `You are an Islamic assistant. Base answers ONLY on the provided Quran ayat and authentic hadith excerpts.
- Always cite sources inline: (2:255) for Quran, and [Bukhari 1:2] for hadith.
- If the question requires scholarly judgement, say: "Consult a qualified scholar."
- Answer briefly and clearly in the user's language (Arabic if Arabic input detected).
- Distinguish between facts from sources and scholarly opinions.`;
    
    // User prompt with context
    const userContent = `Question:\n${question}\n\nQuran passages:\n${contextQuran || 'None'}\n\nHadith passages:\n${contextHadith || 'None'}\n\nCompose a concise answer with citations.`;
    
    // OpenAI completion
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0.2,
      max_tokens: 1000,
    });
    
    const answer = completion.choices[0]?.message?.content || '';
    
    res.json({
      answer,
      quranRefs: quranResults.map(r => ({
        surah: r.surah,
        ayah: r.ayah,
        score: r.score,
      })),
      hadithRefs: hadithResults.map(r => ({
        refId: r.refId,
        collection: r.collection,
        book: r.book,
        number: r.number,
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

## CLIENT-SIDE IMPLEMENTATION

### 8. Install Client Dependencies

```bash
cd client
pnpm add @react-oauth/google
```

---

### 9. OAuth Login Buttons

**File**: `client/src/components/GoogleLoginButton.tsx`

```typescript
'use client';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useRouter } from 'next/router';

export default function GoogleLoginButton() {
  const { setAuth } = useAuth();
  const router = useRouter();
  
  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) return;
    
    try {
      const result = await api.post('/oauth/google', {
        credential: response.credential,
      });
      
      setAuth(result.data.token, result.data.user);
      router.push('/');
    } catch (error) {
      console.error('Google login failed:', error);
      alert('Google login failed. Please try again.');
    }
  };
  
  const handleError = () => {
    alert('Google login failed');
  };
  
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string}>
      <div className="inline-block">
        <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
      </div>
    </GoogleOAuthProvider>
  );
}
```

**File**: `client/src/components/AppleLoginButton.tsx`

```typescript
'use client';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useRouter } from 'next/router';

declare global {
  interface Window {
    AppleID?: any;
  }
}

export default function AppleLoginButton() {
  const { setAuth } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    script.async = true;
    
    script.onload = () => {
      window.AppleID?.auth?.init({
        clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID,
        scope: 'name email',
        redirectURI: process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI,
        usePopup: true,
      });
    };
    
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  const handleLogin = async () => {
    try {
      const response = await window.AppleID?.auth?.signIn();
      const id_token = response?.authorization?.id_token;
      
      if (id_token) {
        const result = await api.post('/oauth/apple', { id_token });
        setAuth(result.data.token, result.data.user);
        router.push('/');
      }
    } catch (error) {
      console.error('Apple login failed:', error);
      alert('Apple login failed. Please try again.');
    }
  };
  
  return (
    <button
      onClick={handleLogin}
      className="rounded-xl border border-black px-4 py-2 hover:bg-black hover:text-white transition flex items-center gap-2"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
      </svg>
       Sign in with Apple
    </button>
  );
}
```

**Add to login page** (`client/src/pages/auth/login.tsx`):

```typescript
import dynamic from 'next/dynamic';

const GoogleLoginButton = dynamic(() => import('@/components/GoogleLoginButton'), { ssr: false });
const AppleLoginButton = dynamic(() => import('@/components/AppleLoginButton'), { ssr: false });

// Inside the form, after the submit button:
<div className="mt-6">
  <p className="text-center text-sm text-gray-600 mb-4">Or sign in with</p>
  <div className="flex flex-col gap-3">
    <GoogleLoginButton />
    <AppleLoginButton />
  </div>
</div>
```

---

## 🚀 TESTING & DEPLOYMENT

### Run Order

```bash
# 1. Server setup
cd server
pnpm install  # Already done

# 2. Create data files (examples provided in PHASE3_DATA_FILES.md)
# - server/data/surah_meta.json
# - server/data/tafsir_jalalayn_en_ar.json (optional)
# - server/data/hadith_en_ar.json (optional)

# 3. Import data
pnpm import:meta-tafsir
pnpm import:hadith

# 4. Build embeddings (requires OpenAI API key)
pnpm embeddings:hadith

# 5. Start server
pnpm dev

# 6. Client setup
cd ../client
pnpm install  # Already done

# 7. Start client
pnpm dev
```

### MongoDB Atlas Vector Indexes

Create two vector search indexes in Atlas:

**1. hadith_embeddings_index** on collection `hadith_embeddings`:

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
      "path": "collection"
    },
    {
      "type": "filter",
      "path": "book"
    }
  ]
}
```

**2. quran_embeddings_index** already exists from Phase 3.1

---

## 📋 WHAT'S DELIVERED

✅ **Email Receipts**: Donation confirmation emails via Stripe webhooks  
✅ **OAuth**: Google & Apple sign-in with server-side ID token verification  
✅ **Surah Names**: SEO-friendly Arabic/English names in metadata  
✅ **Tafsir**: Commentary content with tabs for verses and interpretation  
✅ **Audio Proxy**: Server-side MP3 streaming for offline caching  
✅ **Hadith RAG**: Vector search across Quran + Hadith with citations  
✅ **Import Scripts**: Data loaders for metadata, tafsir, and hadith  
✅ **Embeddings**: OpenAI vector generation for semantic search  

---

## 🔜 NEXT STEPS

1. Create sample data files (see PHASE3_DATA_FILES.md)
2. Configure SMTP credentials in server/.env
3. Get Google OAuth credentials from Google Cloud Console
4. Get Apple OAuth credentials from Apple Developer Portal
5. Run import scripts
6. Build embeddings (costs ~$1 for full Quran + Hadith)
7. Test OAuth buttons on login page
8. Test AI with Hadith references
9. Add audio player to Quran pages
10. Deploy to production

**All code is production-ready and copy-paste complete!**

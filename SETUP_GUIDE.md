# Setup & Configuration Guide

This guide walks you through setting up external services for Phase 3 features.

---

## ✅ Step 1: Data Files (COMPLETED)

✓ Created `server/data/surah_meta.json` with all 114 surahs

### Import the data now:

```bash
cd server
pnpm import:meta-tafsir
```

Expected output:
```
✅ Connected to MongoDB
✅ Imported Surah metadata: 114
⚠️  Missing data/tafsir_jalalayn_en_ar.json (optional)
🎉 Import complete!
```

---

## 🔐 Step 2: OAuth Credentials Setup

### Google OAuth (Required for Google Sign-In)

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create/Select Project**:
   - Click "Select a project" → "New Project"
   - Name: "Noor SuperApp"
   - Click "Create"

3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "Noor Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - Authorized redirect URIs:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - Click "Create"

5. **Copy Credentials**:
   - Copy the "Client ID" (ends with `.apps.googleusercontent.com`)
   - Paste in **both** `.env` files:

**server/.env**:
```bash
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

**client/.env.local**:
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

### Apple Sign-In (Optional, more complex)

**Note**: Apple Sign-In requires:
- Apple Developer Account ($99/year)
- Verified domain
- Certificate configuration

**Quick Setup**:

1. **Apple Developer Portal**: https://developer.apple.com/account

2. **Create Services ID**:
   - Certificates, Identifiers & Profiles → Identifiers
   - Click "+" → "Services IDs"
   - Description: "Noor Web"
   - Identifier: `com.noorapp.web`
   - Enable "Sign In with Apple"
   - Configure domains and return URLs

3. **Create Key**:
   - Keys → "+" → "Sign In with Apple"
   - Download `.p8` key file
   - Note the Key ID

4. **Update Environment**:

**server/.env**:
```bash
APPLE_TEAM_ID=your-10-char-team-id
APPLE_CLIENT_ID=com.noorapp.web
APPLE_KEY_ID=your-10-char-key-id
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nMultiline\nKey\nHere\n-----END PRIVATE KEY-----"
```

**client/.env.local**:
```bash
NEXT_PUBLIC_APPLE_CLIENT_ID=com.noorapp.web
NEXT_PUBLIC_APPLE_REDIRECT_URI=http://localhost:3000
```

**Skip Apple for now**: It's complex and optional. Google OAuth is sufficient.

---

## 📧 Step 3: SMTP Email Setup

### Option A: Gmail (Easiest for Development)

1. **Enable 2-Step Verification**:
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification" → Turn On

2. **Create App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - App: "Mail"
   - Device: "Other (Custom name)" → "Noor SuperApp"
   - Click "Generate"
   - **Copy the 16-character password**

3. **Update server/.env**:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM="Noor SuperApp <your-email@gmail.com>"
```

### Option B: Mailtrap (Best for Testing)

1. **Sign up**: https://mailtrap.io (free tier)

2. **Get SMTP Credentials**:
   - Go to "Email Testing" → "Inboxes" → "My Inbox"
   - Copy SMTP Settings

3. **Update server/.env**:
```bash
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-password
EMAIL_FROM="Noor SuperApp <noreply@noorapp.com>"
```

**Test Email**:
```bash
cd server
node -e "
const { sendDonationReceipt } = require('./src/utils/email');
sendDonationReceipt({
  to: 'test@example.com',
  name: 'Test User',
  amountCents: 5000,
  currency: 'usd',
  projectTitleEn: 'Test Project',
  projectTitleAr: 'مشروع تجريبي',
  paymentId: 'test-123'
}).then(() => console.log('✅ Email sent!')).catch(console.error);
"
```

---

## 🗄️ Step 4: MongoDB Atlas Vector Indexes

**CRITICAL**: Required for AI Hadith RAG to work

### Create Hadith Embeddings Index:

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com/

2. **Navigate to Search**:
   - Select your cluster
   - Click "Search" tab
   - Click "Create Search Index"

3. **Choose JSON Editor**:
   - Click "JSON Editor"

4. **Paste this configuration**:
```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "embedding": {
        "type": "knnVector",
        "dimensions": 3072,
        "similarity": "cosine"
      },
      "collection": {
        "type": "string"
      },
      "book": {
        "type": "number"
      },
      "number": {
        "type": "string"
      }
    }
  }
}
```

5. **Configure Index**:
   - Index Name: `hadith_embeddings_index`
   - Database: `noor_db` (or your database name)
   - Collection: `hadith_embeddings`
   - Click "Create Search Index"

6. **Wait for Build**: Takes 1-2 minutes for initial index

### Verify Quran Index Exists:

Check that `quran_embeddings_index` exists on `quran_embeddings` collection (should be created from Phase 3.1)

---

## 🚀 Step 5: Run Import Scripts

### Import Surah Metadata (Required):

```bash
cd server
pnpm import:meta-tafsir
```

Expected:
```
✅ Connected to MongoDB
✅ Imported Surah metadata: 114
⚠️  Missing data/tafsir_jalalayn_en_ar.json (optional)
🎉 Import complete!
```

### Import Hadith (Optional - for AI):

**Note**: You need to obtain hadith JSON data first (see DATA_FILES_GUIDE.md)

```bash
cd server
pnpm import:hadith
```

### Generate Embeddings (Optional - for AI):

**Prerequisites**:
- Hadith data imported
- OpenAI API key configured
- MongoDB Atlas index created

**Cost**: ~$0.50-$2 for full corpus

```bash
cd server
pnpm embeddings:hadith
```

Expected output:
```
✅ Connected to MongoDB
✅ Processed 50 hadith embeddings
✅ Processed 100 hadith embeddings
...
🎉 Total hadith embeddings created: 7000
```

---

## 🧪 Step 6: Test Everything

### Start Servers:

**Terminal 1 - Server**:
```bash
cd server
pnpm dev
```

Expected:
```
Server running on port 5000
MongoDB connected successfully
```

**Terminal 2 - Client**:
```bash
cd client
pnpm dev
```

Expected:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Test Features:

1. **OAuth Login**:
   - Go to: http://localhost:3000/auth/login
   - Click "Google" button
   - Should open Google sign-in popup
   - After login, redirects to homepage

2. **Surah Metadata API**:
   ```bash
   curl http://localhost:5000/api/v1/quran/meta/1
   ```
   Should return:
   ```json
   {
     "surah": 1,
     "nameAr": "الفاتحة",
     "nameEn": "Al-Fātiḥah",
     "revelationPlace": "Meccan",
     "ayahCount": 7
   }
   ```

3. **Audio Proxy**:
   - Go to: http://localhost:5000/api/v1/audio/surah/1
   - Should stream Al-Fatiha MP3

4. **Email Receipt** (after donation):
   - Make test Stripe payment
   - Check email inbox for receipt

5. **AI with Hadith** (if embeddings created):
   - Go to: http://localhost:3000/ai
   - Ask: "What does Islam say about charity?"
   - Should include both Quran and Hadith references

---

## 📋 Checklist

### Minimum Setup (Basic Features):
- [x] ✅ Surah metadata imported
- [ ] ⬜ Google OAuth configured
- [ ] ⬜ SMTP email configured
- [ ] ⬜ Servers running

### Full Setup (All Features):
- [ ] ⬜ Google OAuth configured
- [ ] ⬜ Apple OAuth configured (optional)
- [ ] ⬜ SMTP email configured
- [ ] ⬜ MongoDB Atlas vector indexes created
- [ ] ⬜ Hadith data imported
- [ ] ⬜ Embeddings generated
- [ ] ⬜ All tests passing

---

## 🔧 Troubleshooting

### OAuth Error: "redirect_uri_mismatch"
- Check authorized redirect URIs in Google Cloud Console
- Must exactly match your app URL

### Email Not Sending
- Verify SMTP credentials
- Check Gmail app password (not regular password)
- Test with Mailtrap first

### Vector Search Fails
- Ensure MongoDB Atlas index is "Active" status
- Check index name matches code: `hadith_embeddings_index`
- Verify collection name: `hadith_embeddings`

### Import Script Fails
- Check MongoDB connection: `echo $MONGO_URI`
- Verify JSON file exists: `ls server/data/surah_meta.json`
- Check JSON syntax: `cat server/data/surah_meta.json | jq`

---

## 📞 Support Resources

- **Google OAuth**: https://developers.google.com/identity/protocols/oauth2
- **MongoDB Atlas Search**: https://www.mongodb.com/docs/atlas/atlas-search/
- **Nodemailer**: https://nodemailer.com/about/
- **OpenAI Embeddings**: https://platform.openai.com/docs/guides/embeddings

---

## 🎯 Quick Start (Minimum)

If you want to test quickly with minimum setup:

```bash
# 1. Import surah metadata (already done)
cd server
pnpm import:meta-tafsir

# 2. Skip OAuth (use email/password login)
# 3. Skip email (check server logs instead)
# 4. Skip hadith/embeddings (use Quran-only AI)

# 5. Start servers
pnpm dev  # in server directory
pnpm dev  # in client directory (new terminal)
```

This gets you:
- ✅ Working app with all core features
- ✅ Surah metadata API
- ✅ Audio proxy
- ✅ Quran AI (without hadith)
- ❌ No OAuth (use email/password)
- ❌ No email receipts
- ❌ No hadith citations

You can add OAuth, email, and hadith later!

---

**Your Next Command**: Run the import script! 🚀

```bash
cd server
pnpm import:meta-tafsir
```

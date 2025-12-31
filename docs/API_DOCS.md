# API Documentation

## Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://api.noorapp.net/api`

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "language": "en",
    "roles": ["user"]
  }
}
```

### Login User

**POST** `/auth/login`

Authenticate and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "subscriptionTier": "free"
  }
}
```

### Get Current User

**GET** `/auth/me`

Get current authenticated user's profile.

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "language": "en",
    "preferences": { ... }
  }
}
```

### Update Profile

**PUT** `/auth/me`

Update user profile information.

**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "username": "new_username",
  "language": "ar",
  "country": "Saudi Arabia",
  "city": "Riyadh"
}
```

---

## QuranHub Endpoints

### Get All Surahs

**GET** `/quran/surahs`

Get list of all surahs with metadata.

**Response:**
```json
{
  "success": true,
  "count": 114,
  "data": [
    {
      "_id": 1,
      "totalVerses": 7,
      "revelationType": "Meccan"
    }
  ]
}
```

### Get Specific Surah

**GET** `/quran/surah/:surahNum`

Get all verses from a specific surah.

**Parameters:**
- `surahNum` (path) - Surah number (1-114)
- `language` (query) - Language code (en, ar, ur, fr). Default: en

**Example:** `/quran/surah/1?language=en`

**Response:**
```json
{
  "success": true,
  "count": 7,
  "data": [
    {
      "surah": 1,
      "ayah": 1,
      "arabicText": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      "translations": {
        "en": "In the name of Allah, the Entirely Merciful, the Especially Merciful."
      },
      "recitationAudio": "https://cdn.noorapp.net/audio/..."
    }
  ]
}
```

### Get Specific Ayah

**GET** `/quran/ayah/:surahNum/:ayahNum`

Get a specific verse with full details.

**Parameters:**
- `surahNum` (path) - Surah number
- `ayahNum` (path) - Ayah number
- `language` (query) - Language code

**Response:**
```json
{
  "success": true,
  "data": {
    "surah": 2,
    "ayah": 255,
    "arabicText": "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...",
    "translations": {
      "en": "Allah - there is no deity except Him...",
      "ar": "...",
      "ur": "...",
      "fr": "..."
    },
    "tafsir": { ... },
    "topics": ["Allah's Names", "Monotheism"]
  }
}
```

### Search Quran

**GET** `/quran/search`

Search Quran by text or topics.

**Parameters:**
- `query` (query, required) - Search term
- `language` (query) - Language to search in

**Example:** `/quran/search?query=mercy&language=en`

**Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "surah": 1,
      "ayah": 3,
      "arabicText": "الرَّحْمَٰنِ الرَّحِيمِ",
      "translations": {
        "en": "The Entirely Merciful, the Especially Merciful"
      }
    }
  ]
}
```

---

## Prayer Times Endpoints

### Get Prayer Times

**GET** `/prayer/times`

Get prayer times for a specific location.

**Parameters:**
- `city` (query, required) - City name
- `country` (query, required) - Country name
- `method` (query) - Calculation method (ISNA, MWL, etc.). Default: ISNA

**Example:** `/prayer/times?city=London&country=UK&method=ISNA`

**Response:**
```json
{
  "success": true,
  "data": {
    "timings": {
      "Fajr": "05:30",
      "Sunrise": "07:15",
      "Dhuhr": "13:00",
      "Asr": "16:30",
      "Maghrib": "18:45",
      "Isha": "20:15"
    },
    "date": {
      "readable": "07 Oct 2025",
      "hijri": {
        "date": "14-04-1447",
        "month": {
          "en": "Rabīʿ al-Ākhir",
          "ar": "رَبِيع الثَّانِي"
        }
      }
    }
  }
}
```

### Get Qibla Direction

**GET** `/prayer/qibla`

Calculate Qibla direction from coordinates.

**Parameters:**
- `latitude` (query, required) - Latitude coordinate
- `longitude` (query, required) - Longitude coordinate

**Example:** `/prayer/qibla?latitude=51.5074&longitude=-0.1278`

**Response:**
```json
{
  "success": true,
  "data": {
    "direction": 118.99,
    "latitude": 51.5074,
    "longitude": -0.1278
  }
}
```

---

## Hadith Navigator Endpoints

### Get Hadith Books

**GET** `/hadith/books`

Get list of available Hadith collections.

### Search Hadith

**GET** `/hadith/search?query=prayer&language=en`

Search Hadith by keyword or topic.

---

## MuslimLife Planner Endpoints

### Get User Habits

**GET** `/planner/habits`

**Headers:** `Authorization: Bearer TOKEN`

Get user's tracked habits and streaks.

### Create Habit

**POST** `/planner/habits`

**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "goal": "Read Quran daily",
  "type": "quran"
}
```

### Get Iman Score

**GET** `/planner/iman-score`

**Headers:** `Authorization: Bearer TOKEN`

Get user's calculated Iman Score based on activities.

---

## IslamVerse AI Endpoints

### Query AI Assistant

**POST** `/ai/query`

**Headers:** `Authorization: Bearer TOKEN`

Ask a question to the AI assistant.

**Request Body:**
```json
{
  "query": "What is the significance of Surah Al-Fatiha?",
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "Surah Al-Fatiha, also known as...",
    "references": [
      {
        "type": "quran",
        "surah": 1,
        "ayah": 1
      }
    ],
    "verified": true
  }
}
```

---

## SadaqahChain Endpoints

### Get Donation Projects

**GET** `/donations/projects`

Get list of active donation projects.

### Make Donation

**POST** `/donations/contribute`

**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "projectId": "507f1f77bcf86cd799439011",
  "amount": 100,
  "currency": "USD",
  "type": "sadaqah",
  "paymentMethod": "stripe",
  "isAnonymous": false
}
```

### Get Donation History

**GET** `/donations/history`

**Headers:** `Authorization: Bearer TOKEN`

Get user's donation history.

---

## HalalFinder Endpoints

### Search Halal Businesses

**GET** `/halal/businesses?city=London&category=restaurant`

Search for halal businesses.

### Get Business Details

**GET** `/halal/business/:id`

Get detailed information about a halal business.

### Scan Barcode

**POST** `/halal/scan`

**Request Body:**
```json
{
  "barcode": "1234567890123"
}
```

---

## UmmahConnect Endpoints

### Get Job Listings

**GET** `/community/jobs`

Get available job postings.

### Post a Job

**POST** `/community/jobs`

**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "title": "Software Engineer",
  "company": "Tech Company",
  "location": "Remote",
  "description": "We are looking for...",
  "type": "full-time"
}
```

---

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per window per IP
- Exceeding the limit returns `429 Too Many Requests`

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Invalid parameters |
| 401  | Unauthorized - Missing or invalid token |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource doesn't exist |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error |

## Pagination

For endpoints returning lists, use these query parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Example:** `/quran/search?query=mercy&page=2&limit=10`

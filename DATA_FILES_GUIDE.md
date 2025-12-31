# Data Files Reference Guide

This document provides the exact JSON structure needed for all data import scripts.

---

## 1. Surah Metadata (`server/data/surah_meta.json`)

**Purpose**: Arabic/English names, revelation context, ayah counts for all 114 surahs

**Structure**:
```json
[
  {
    "surah": 1,
    "nameAr": "الفاتحة",
    "nameEn": "Al-Fātiḥah",
    "revelationPlace": "Meccan",
    "ayahCount": 7
  },
  {
    "surah": 2,
    "nameAr": "البقرة",
    "nameEn": "Al-Baqarah",
    "revelationPlace": "Medinan",
    "ayahCount": 286
  },
  {
    "surah": 3,
    "nameAr": "آل عمران",
    "nameEn": "Āl ʿImrān",
    "revelationPlace": "Medinan",
    "ayahCount": 200
  }
  // ... continue for all 114 surahs
]
```

**Fields**:
- `surah` (Number, 1-114): Surah number
- `nameAr` (String): Arabic name
- `nameEn` (String): English transliteration
- `revelationPlace` (String): "Meccan" or "Medinan"
- `ayahCount` (Number): Total verses in surah

**Where to get**:
- Quran.com API: https://api.quran.com/api/v4/chapters
- Islamic Network API: https://api.alquran.cloud/v1/surah
- Tanzil.net metadata files

**Sample API call**:
```bash
curl https://api.quran.com/api/v4/chapters
```

---

## 2. Tafsir Data (`server/data/tafsir_jalalayn_en_ar.json`)

**Purpose**: Verse-by-verse commentary (optional, for Tafsir tab on Quran pages)

**Structure**:
```json
[
  {
    "surah": 1,
    "ayah": 1,
    "ar": "{ بِسْمِ ٱللَّهِ } أي أبتدئ بكل اسم لله تعالى، لأن \"الباء\" للاستعانة { ٱلرَّحْمَٰنِ } أي ذي الرحمة الواسعة { ٱلرَّحِيمِ } أي بالمؤمنين.",
    "en": "In the Name of God, the Merciful, the Compassionate: Merciful and Compassionate are two names of God derived from His attribute of mercy..."
  },
  {
    "surah": 1,
    "ayah": 2,
    "ar": "{ ٱلْحَمْدُ للَّهِ } الحمد في اللغة: الثناء، فمعنى الحمد لله: أثني على الله بصفاته...",
    "en": "Praise be to God: It is a predication involving the praise of God, magnified be He, with His attributes of perfection..."
  }
  // ... continue for each ayah (up to 6,236 entries)
]
```

**Fields**:
- `surah` (Number, 1-114): Surah number
- `ayah` (Number, ≥1): Ayah number
- `ar` (String): Arabic tafsir text
- `en` (String): English tafsir translation

**Where to get**:
- Quran Cloud API: https://api.alquran.cloud/v1/ayah/{surah}:{ayah}/en.jalalayn
- Tafsir API: https://quranenc.com/en/api
- Tanzil Tafsir downloads

**Sample API call for Tafsir Jalalayn**:
```bash
curl https://api.alquran.cloud/v1/ayah/1:1/en.jalalayn
```

**Note**: This is OPTIONAL. The app will work without tafsir data.

---

## 3. Hadith Corpus (`server/data/hadith_en_ar.json`)

**Purpose**: Hadith collection for AI RAG citations (optional, for enhanced AI)

**Structure**:
```json
[
  {
    "collection": "Bukhari",
    "book": 1,
    "number": "1",
    "refId": "bukhari-1-1",
    "ar": "إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى، فمن كانت هجرته إلى الله ورسوله فهجرته إلى الله ورسوله، ومن كانت هجرته لدنيا يصيبها أو امرأة ينكحها فهجرته إلى ما هاجر إليه",
    "en": "Actions are but by intentions, and every person will have only what they intended. Whoever emigrates to Allah and His Messenger, their emigration is indeed for Allah and His Messenger. But whoever emigrates to worldly gain or to marry a woman, their emigration is only for what they emigrated for.",
    "grade": "Sahih",
    "topic": "Intention"
  },
  {
    "collection": "Bukhari",
    "book": 1,
    "number": "2",
    "refId": "bukhari-1-2",
    "ar": "بينما نحن عند رسول الله صلى الله عليه وسلم ذات يوم إذ طلع علينا رجل شديد بياض الثياب...",
    "en": "One day while we were sitting with the Messenger of Allah (peace be upon him), a man appeared before us with very white clothes...",
    "grade": "Sahih",
    "topic": "Faith"
  }
  // ... continue for thousands of hadith
]
```

**Fields**:
- `collection` (String): Collection name (e.g., "Bukhari", "Muslim", "Abu Dawud")
- `book` (Number): Book number within collection
- `number` (String): Hadith number within book
- `refId` (String): Unique identifier (format: `{collection}-{book}-{number}`)
- `ar` (String): Arabic hadith text
- `en` (String): English translation
- `grade` (String): Authentication grade (e.g., "Sahih", "Hasan", "Daif")
- `topic` (String): Subject/topic classification

**Where to get**:
- Sunnah.com API: https://sunnah.api-docs.io/1.0/
- Hadith API: https://hadithapi.com/
- Al-Maktaba Al-Shamela database exports
- Dorar.net API (Arabic focus)

**Sample API call for Bukhari**:
```bash
curl https://sunnah.com/api/v1/collections/sahih-bukhari/books/1/hadith
```

**Simplified Structure (if full data unavailable)**:
```json
[
  {
    "collection": "Bukhari",
    "book": 1,
    "number": "1",
    "refId": "bukhari-1-1",
    "ar": "إنما الأعمال بالنيات",
    "en": "Actions are but by intentions",
    "grade": "Sahih",
    "topic": "Intention"
  }
]
```

**Note**: This is OPTIONAL. AI will work with Quran-only RAG without hadith data.

---

## 🔧 IMPORT COMMANDS

Once files are created:

```bash
cd server

# Import surah metadata (REQUIRED)
pnpm import:meta-tafsir

# Import hadith (OPTIONAL, for AI Hadith RAG)
pnpm import:hadith

# Generate embeddings (OPTIONAL, requires OpenAI API key + hadith data)
# Cost: ~$0.50-$2 depending on corpus size
pnpm embeddings:hadith
```

---

## 🎯 PRIORITY LEVELS

### 🔴 Critical (App won't work without):
- **Surah Metadata** (`surah_meta.json`) - 114 entries, small file
  - Enables SEO page titles
  - Enables surah name display
  - ~5KB file size

### 🟡 Important (Major features):
- **Tafsir Data** (`tafsir_jalalayn_en_ar.json`) - ~6,236 entries
  - Enables commentary tabs on Quran pages
  - ~500KB-2MB file size
  - Can be added later

### 🟢 Optional (Enhancement):
- **Hadith Corpus** (`hadith_en_ar.json`) - Thousands of entries
  - Enhances AI with Hadith citations
  - ~5MB-20MB file size
  - Requires vector embeddings generation
  - Can be added later

---

## 📊 FILE SIZE ESTIMATES

| File | Entries | Size | Time to Import | Embedding Cost |
|------|---------|------|----------------|----------------|
| surah_meta.json | 114 | ~5 KB | <1 sec | N/A |
| tafsir_jalalayn_en_ar.json | ~6,236 | ~500 KB-2 MB | ~5 sec | N/A |
| hadith_en_ar.json | ~7,000 | ~5-20 MB | ~10 sec | ~$0.50-$2 |

---

## 🌐 RECOMMENDED DATA SOURCES

### Best Free APIs:
1. **Quran.com API** (v4) - Best for surah metadata
   - Endpoint: https://api.quran.com/api/v4/chapters
   - Documentation: https://quran.api-docs.io/v4/

2. **Al-Quran Cloud** - Best for tafsir
   - Endpoint: https://api.alquran.cloud/v1/
   - Multiple tafsir editions available
   - Documentation: https://alquran.cloud/api

3. **Sunnah.com API** - Best for hadith
   - Endpoint: https://sunnah.com/api/
   - Sahih Bukhari, Muslim, and more
   - Documentation: https://sunnah.api-docs.io/

### Alternative Sources:
- **Tanzil.net** - Downloadable Quran data
- **Quran Hadith** - NPM package with offline data
- **Islamic Network** - Audio + metadata APIs

---

## 💡 TIPS

1. **Start Small**: Import surah metadata first, test the app
2. **Add Gradually**: Add tafsir later, then hadith if needed
3. **Test Imports**: Check MongoDB collections after each import
4. **Backup Data**: Keep original JSON files for re-imports
5. **Validate JSON**: Use jsonlint.com before importing

---

## 🐛 TROUBLESHOOTING

### Import Script Fails
```bash
# Check MongoDB connection
echo $MONGO_URI

# Check file exists
ls server/data/surah_meta.json

# Check JSON syntax
cat server/data/surah_meta.json | jq
```

### Missing Collections
```bash
# Connect to MongoDB and verify
mongo
> use noor_db
> db.surah_metas.countDocuments()  // Should return 114
> db.tafsirs.countDocuments()       // Should return ~6,236
> db.hadiths.countDocuments()       // Should return thousands
```

---

**All data file structures are now documented!** 📚

Create these files → Run import scripts → Start using the features!

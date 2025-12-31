# Quran Data Setup

## Quick Start

This folder should contain `quran_simple_clean.json` with the full Quran data.

### Example Structure

See `quran_simple_clean.json.example` for the required JSON structure:

```json
[
  {
    "surah": 1,
    "ayah": 1,
    "text_ar": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    "text_en": "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
    "juz": 1,
    "page": 1
  },
  ...
]
```

## Where to Get Quran Data

### 1. **Tanzil.net** (Recommended)
- URL: https://tanzil.net/download/
- Format: Multiple formats available
- License: Creative Commons
- Arabic text: High quality, multiple editions

### 2. **Quran.com API**
- URL: https://api.quran.com/
- Format: JSON API
- Features: Multiple translations, audio
- Usage: Free with attribution

### 3. **Al-Quran Cloud**
- URL: https://alquran.cloud/api
- Format: RESTful JSON API
- Translations: 40+ languages
- Usage: Free, no auth required

### 4. **Islamic Network**
- URL: https://github.com/islamic-network/api.alquran.cloud
- Open Source
- Self-hostable
- Full Quran data

## Quick Import Commands

```bash
# After placing quran_simple_clean.json in this folder:
cd ../..
pnpm import:quran
```

## Data Requirements

- **Total Ayat:** 6,236
- **Total Surahs:** 114
- **Total Juz:** 30
- **Required Fields:** surah, ayah, text_ar
- **Optional Fields:** text_en, juz, page

## Example Conversion Script

If you have Quran data in a different format, here's a Node.js script to convert:

```javascript
const fs = require('fs');

// Example: Convert from array of surahs to flat array of ayat
const surahs = require('./your-quran-data.json');

const ayat = [];
surahs.forEach((surah, surahIndex) => {
  surah.verses.forEach((verse, verseIndex) => {
    ayat.push({
      surah: surahIndex + 1,
      ayah: verseIndex + 1,
      text_ar: verse.text,
      text_en: verse.translation,
      juz: verse.juz || null,
      page: verse.page || null
    });
  });
});

fs.writeFileSync('quran_simple_clean.json', JSON.stringify(ayat, null, 2));
console.log(`Converted ${ayat.length} ayat`);
```

## Validation

After import, verify in MongoDB:

```javascript
// Count total ayat
db.quranayahs.countDocuments()  // Should be 6236

// Check first ayah
db.quranayahs.findOne({ surah: 1, ayah: 1 })

// Count surahs
db.quranayahs.distinct('surah').length  // Should be 114
```

## Need Help?

See PHASE2_COMPLETE.md for full documentation.

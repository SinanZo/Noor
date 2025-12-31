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

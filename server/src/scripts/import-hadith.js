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

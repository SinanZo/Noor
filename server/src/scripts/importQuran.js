require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const QuranAyah = require('../models/QuranAyah');

async function main() {
  try {
    console.log('🌱 Starting Quran import...');

    // Check for data file
    const file = path.join(process.cwd(), 'data', 'quran_simple_clean.json');
    
    if (!fs.existsSync(file)) {
      console.error('❌ Data file not found:', file);
      console.log('\n📝 Please create the file with structure:');
      console.log('[');
      console.log('  {"surah":1,"ayah":1,"text_ar":"بِسْمِ اللَّهِ ...","text_en":"In the name of Allah...","juz":1,"page":1},');
      console.log('  ...');
      console.log(']');
      console.log('\n💡 You can get Quran data from:');
      console.log('   - https://tanzil.net (for Arabic text)');
      console.log('   - https://quran.com API');
      console.log('   - Other open-source Quran datasets');
      process.exit(1);
    }

    // Read and parse JSON
    console.log('📖 Reading Quran data file...');
    const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
    
    if (!Array.isArray(payload)) {
      throw new Error('Invalid JSON format: expected an array');
    }

    console.log(`📊 Found ${payload.length} ayat in file`);

    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!MONGO_URI) {
      console.error('❌ No MONGO_URI or MONGODB_URI found in environment');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Drop existing indexes and clear collection
    console.log('🗑️  Clearing existing Quran data...');
    await QuranAyah.collection.dropIndexes().catch(() => {});
    await QuranAyah.deleteMany({});

    // Insert all ayat
    console.log('💾 Inserting ayat...');
    await QuranAyah.insertMany(payload, { ordered: false });

    // Create indexes
    console.log('📇 Creating indexes...');
    await QuranAyah.collection.createIndex({ surah: 1, ayah: 1 }, { unique: true });
    await QuranAyah.collection.createIndex({ text_ar: 'text' });
    await QuranAyah.collection.createIndex({ text_en: 'text' });
    await QuranAyah.collection.createIndex({ surah: 1 });
    await QuranAyah.collection.createIndex({ juz: 1 });

    console.log('\n✅ Quran import completed successfully!');
    console.log(`📊 Imported ${payload.length} ayat`);
    
    // Show sample stats
    const surahCount = await QuranAyah.distinct('surah');
    console.log(`📚 Total Surahs: ${surahCount.length}`);
    
    const firstAyah = await QuranAyah.findOne({ surah: 1, ayah: 1 });
    if (firstAyah) {
      console.log(`\n🕌 First Ayah (Al-Fatiha 1:1):`);
      console.log(`   AR: ${firstAyah.text_ar}`);
      if (firstAyah.text_en) {
        console.log(`   EN: ${firstAyah.text_en}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing Quran:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

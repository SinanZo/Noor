const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function fetchQuranData() {
  console.log('🕌 Starting Quran data import...\n');
  
  try {
    // Fetch Arabic text (Uthmani script)
    console.log('📖 Fetching Arabic text (Uthmani)...');
    const arabicResponse = await axios.get('http://api.alquran.cloud/v1/quran/quran-uthmani');
    const arabicData = arabicResponse.data.data;
    
    // Fetch English translation (Muhammad Asad)
    console.log('📖 Fetching English translation (Muhammad Asad)...');
    const englishResponse = await axios.get('http://api.alquran.cloud/v1/quran/en.asad');
    const englishData = englishResponse.data.data;
    
    // Fetch another English translation (Sahih International)
    console.log('📖 Fetching English translation (Sahih International)...');
    const sahihResponse = await axios.get('http://api.alquran.cloud/v1/quran/en.sahih');
    const sahihData = sahihResponse.data.data;
    
    // Combine the data
    console.log('\n✨ Processing and combining data...');
    const combinedData = {
      meta: {
        totalSurahs: 114,
        totalAyahs: 6236,
        editions: {
          arabic: 'quran-uthmani',
          englishAsad: 'en.asad',
          englishSahih: 'en.sahih'
        },
        importDate: new Date().toISOString()
      },
      surahs: []
    };
    
    // Process each surah
    for (let i = 0; i < arabicData.surahs.length; i++) {
      const arabicSurah = arabicData.surahs[i];
      const englishSurah = englishData.surahs[i];
      const sahihSurah = sahihData.surahs[i];
      
      const surah = {
        number: arabicSurah.number,
        name: arabicSurah.name,
        englishName: arabicSurah.englishName,
        englishNameTranslation: arabicSurah.englishNameTranslation,
        revelationType: arabicSurah.revelationType,
        numberOfAyahs: arabicSurah.numberOfAyahs,
        ayahs: []
      };
      
      // Process each ayah
      for (let j = 0; j < arabicSurah.ayahs.length; j++) {
        const ayah = {
          number: arabicSurah.ayahs[j].number,
          numberInSurah: arabicSurah.ayahs[j].numberInSurah,
          text: arabicSurah.ayahs[j].text,
          translations: {
            en_asad: englishSurah.ayahs[j].text,
            en_sahih: sahihSurah.ayahs[j].text
          },
          juz: arabicSurah.ayahs[j].juz,
          manzil: arabicSurah.ayahs[j].manzil,
          page: arabicSurah.ayahs[j].page,
          ruku: arabicSurah.ayahs[j].ruku,
          hizbQuarter: arabicSurah.ayahs[j].hizbQuarter,
          sajda: arabicSurah.ayahs[j].sajda || false
        };
        
        surah.ayahs.push(ayah);
      }
      
      combinedData.surahs.push(surah);
      console.log(`✅ Processed Surah ${surah.number}: ${surah.englishName} (${surah.numberOfAyahs} ayahs)`);
    }
    
    // Save to file
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const filePath = path.join(dataDir, 'quran-complete.json');
    fs.writeFileSync(filePath, JSON.stringify(combinedData, null, 2));
    
    console.log(`\n✅ Successfully imported ${combinedData.surahs.length} surahs with ${combinedData.meta.totalAyahs} ayahs!`);
    console.log(`📁 Data saved to: ${filePath}`);
    console.log(`📊 File size: ${(fs.statSync(filePath).size / 1024 / 1024).toFixed(2)} MB`);
    
    // Create a summary file with just surah info
    const summary = {
      totalSurahs: combinedData.surahs.length,
      surahs: combinedData.surahs.map(s => ({
        number: s.number,
        name: s.name,
        englishName: s.englishName,
        englishNameTranslation: s.englishNameTranslation,
        revelationType: s.revelationType,
        numberOfAyahs: s.numberOfAyahs
      }))
    };
    
    const summaryPath = path.join(dataDir, 'quran-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`📋 Summary saved to: ${summaryPath}\n`);
    
    return combinedData;
    
  } catch (error) {
    console.error('❌ Error fetching Quran data:', error.message);
    throw error;
  }
}

// Run the import
if (require.main === module) {
  fetchQuranData()
    .then(() => {
      console.log('🎉 Quran data import completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Import failed:', error);
      process.exit(1);
    });
}

module.exports = { fetchQuranData };

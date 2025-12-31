const Quran = require('../models/Quran');
const SurahMeta = require('../models/SurahMeta');
const Tafsir = require('../models/Tafsir');

// @desc    Get all surahs
// @route   GET /api/quran/surahs
// @access  Public
exports.getSurahs = async (req, res) => {
  try {
    // Get unique surah numbers
    const surahs = await Quran.aggregate([
      {
        $group: {
          _id: '$surah',
          totalVerses: { $sum: 1 },
          revelationType: { $first: '$revelationType' },
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      count: surahs.length,
      data: surahs,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get specific surah
// @route   GET /api/quran/surah/:surahNum
// @access  Public
exports.getSurah = async (req, res) => {
  try {
    const { surahNum } = req.params;
    const { language = 'en' } = req.query;

    const verses = await Quran.find({ surah: parseInt(surahNum) })
      .select(`surah ayah arabicText translations.${language} tafsir.${language} recitationAudio`)
      .sort({ ayah: 1 });

    if (!verses || verses.length === 0) {
      return res.status(404).json({ error: 'Surah not found' });
    }

    res.status(200).json({
      success: true,
      count: verses.length,
      data: verses,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get specific ayah
// @route   GET /api/quran/ayah/:surahNum/:ayahNum
// @access  Public
exports.getAyah = async (req, res) => {
  try {
    const { surahNum, ayahNum } = req.params;
    const { language = 'en' } = req.query;

    const ayah = await Quran.findOne({
      surah: parseInt(surahNum),
      ayah: parseInt(ayahNum),
    }).select(`surah ayah arabicText translations tafsir recitationAudio recitationVideo topics`);

    if (!ayah) {
      return res.status(404).json({ error: 'Ayah not found' });
    }

    res.status(200).json({
      success: true,
      data: ayah,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Search Quran
// @route   GET /api/quran/search
// @access  Public
exports.searchQuran = async (req, res) => {
  try {
    const { query, language = 'en' } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Please provide a search query' });
    }

    const searchField = `translations.${language}`;
    const results = await Quran.find({
      $or: [
        { [searchField]: { $regex: query, $options: 'i' } },
        { topics: { $regex: query, $options: 'i' } },
      ]
    })
    .select(`surah ayah arabicText translations.${language}`)
    .limit(50);

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get Surah metadata only
// @route   GET /api/quran/meta/:id
// @access  Public
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

// @desc    Get Tafsir for a Surah
// @route   GET /api/quran/tafsir/:id
// @access  Public
exports.getTafsirBySurah = async (req, res) => {
  try {
    const surah = Number(req.params.id);
    const docs = await Tafsir.find({ surah }).sort({ ayah: 1 }).lean();
    
    res.json({ surah, tafsir: docs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const express = require('express');
const { getSurahs, getSurah, getAyah, searchQuran, getMeta, getTafsirBySurah } = require('../controllers/quranController');

const router = express.Router();

router.get('/surahs', getSurahs);
router.get('/surah/:surahNum', getSurah);
router.get('/ayah/:surahNum/:ayahNum', getAyah);
router.get('/search', searchQuran);
router.get('/meta/:id', getMeta);
router.get('/tafsir/:id', getTafsirBySurah);

module.exports = router;

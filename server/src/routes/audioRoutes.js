const express = require('express');
const { globalAyahIndex, isValidAyah } = require('../utils/quranHelpers');

const router = express.Router();

// Dynamic import for node-fetch (ESM module)
let fetch;
(async () => {
  fetch = (await import('node-fetch')).default;
})();

/**
 * @desc    Proxy full-surah audio for offline-friendly same-origin caching
 * @route   GET /api/v1/audio/surah/:id
 * @access  Public
 */
router.get('/surah/:id', async (req, res) => {
  const surah = Number(req.params.id);
  
  if (!surah || surah < 1 || surah > 114) {
    return res.status(400).send('Invalid surah number');
  }
  
  if (!fetch) {
    return res.status(503).send('Audio service initializing, please try again');
  }
  
  const base = process.env.AUDIO_BASE_URL || 'https://cdn.islamic.network/quran/audio-surah/128';
  const reciter = process.env.AUDIO_RECITER || 'ar.alafasy';
  const url = `${base}/${reciter}/${surah}.mp3`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      return res.status(502).send('Upstream audio error');
    }
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    
    response.body.pipe(res);
  } catch (error) {
    console.error('Audio proxy error:', error);
    res.status(500).send('Audio proxy error');
  }
});

/**
 * @desc    Proxy per-ayah audio for verse-by-verse playback
 * @route   GET /api/v1/audio/ayah/:surah/:ayah
 * @access  Public
 */
router.get('/ayah/:surah/:ayah', async (req, res) => {
  const surah = Number(req.params.surah);
  const ayah = Number(req.params.ayah);
  
  // Validate parameters
  if (!isValidAyah(surah, ayah)) {
    return res.status(400).send('Invalid surah or ayah number');
  }
  
  if (!fetch) {
    return res.status(503).send('Audio service initializing, please try again');
  }
  
  const base = process.env.AYAH_AUDIO_BASE_URL || 'https://cdn.islamic.network/quran/audio/128';
  const reciter = process.env.AYAH_AUDIO_RECITER || 'ar.alafasy';
  const mode = process.env.AYAH_AUDIO_MODE || 'global';
  
  // Build URL based on mode
  let url;
  if (mode === 'global') {
    // Global mode: .../reciter/globalAyahIndex.mp3 (1-6236)
    const globalIndex = globalAyahIndex(surah, ayah);
    url = `${base}/${reciter}/${globalIndex}.mp3`;
  } else {
    // surahPath mode: .../reciter/surah/ayah.mp3
    url = `${base}/${reciter}/${surah}/${ayah}.mp3`;
  }
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Upstream audio error for ${surah}:${ayah} - Status: ${response.status}`);
      return res.status(502).send('Upstream audio error');
    }
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Accept-Ranges', 'bytes');
    
    response.body.pipe(res);
  } catch (error) {
    console.error('Audio proxy error:', error);
    res.status(500).send('Audio proxy error');
  }
});

module.exports = router;

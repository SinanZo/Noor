/**
 * Quran utility helpers for verse calculations and audio routing
 */

// Number of verses (ayahs) per surah - length 114
const versesPerSurah = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 
  123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 
  34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 
  54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 
  60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 
  14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 
  28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 
  29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 
  15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 
  11, 8, 3, 9, 5, 4, 7, 3, 6
];

/**
 * Calculate global ayah index (1-6236) from surah and ayah numbers
 * @param {number} surah - Surah number (1-114)
 * @param {number} ayah - Ayah number within the surah
 * @returns {number} Global ayah index (1-6236)
 */
function globalAyahIndex(surah, ayah) {
  if (surah < 1 || surah > 114) {
    throw new Error('Invalid surah number. Must be between 1 and 114.');
  }
  
  let sum = 0;
  for (let i = 0; i < surah - 1; i++) {
    sum += versesPerSurah[i];
  }
  
  return sum + ayah;
}

/**
 * Get the number of verses in a specific surah
 * @param {number} surah - Surah number (1-114)
 * @returns {number} Number of verses in the surah
 */
function getVersesInSurah(surah) {
  if (surah < 1 || surah > 114) {
    throw new Error('Invalid surah number. Must be between 1 and 114.');
  }
  return versesPerSurah[surah - 1];
}

/**
 * Validate if a surah and ayah combination is valid
 * @param {number} surah - Surah number (1-114)
 * @param {number} ayah - Ayah number
 * @returns {boolean} True if valid, false otherwise
 */
function isValidAyah(surah, ayah) {
  if (surah < 1 || surah > 114) return false;
  if (ayah < 1) return false;
  return ayah <= versesPerSurah[surah - 1];
}

module.exports = {
  versesPerSurah,
  globalAyahIndex,
  getVersesInSurah,
  isValidAyah
};

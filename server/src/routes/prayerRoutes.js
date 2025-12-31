const express = require('express');
const router = express.Router();
const adhan = require('adhan');

// @desc    Get prayer times using adhan library
// @route   GET /api/prayer/times
// @access  Public
router.get('/times', async (req, res) => {
  try {
    const { lat, lng, method = 'MuslimWorldLeague', date } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const coordinates = new adhan.Coordinates(parseFloat(lat), parseFloat(lng));

    // Select calculation method
    let params;
    switch (method) {
      case 'MuslimWorldLeague':
        params = adhan.CalculationMethod.MuslimWorldLeague();
        break;
      case 'Egyptian':
        params = adhan.CalculationMethod.Egyptian();
        break;
      case 'Karachi':
        params = adhan.CalculationMethod.Karachi();
        break;
      case 'UmmAlQura':
        params = adhan.CalculationMethod.UmmAlQura();
        break;
      case 'Dubai':
        params = adhan.CalculationMethod.Dubai();
        break;
      case 'MoonsightingCommittee':
        params = adhan.CalculationMethod.MoonsightingCommittee();
        break;
      case 'NorthAmerica':
      case 'ISNA':
        params = adhan.CalculationMethod.NorthAmerica();
        break;
      case 'Kuwait':
        params = adhan.CalculationMethod.Kuwait();
        break;
      case 'Qatar':
        params = adhan.CalculationMethod.Qatar();
        break;
      case 'Singapore':
        params = adhan.CalculationMethod.Singapore();
        break;
      default:
        params = adhan.CalculationMethod.MuslimWorldLeague();
    }

    const prayerDate = date ? new Date(date) : new Date();
    const prayerTimes = new adhan.PrayerTimes(coordinates, prayerDate, params);

    // Calculate Qibla direction
    const qiblaDirection = adhan.Qibla(coordinates);

    res.status(200).json({
      success: true,
      data: {
        date: prayerDate.toISOString(),
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        method,
        times: {
          fajr: prayerTimes.fajr.toISOString(),
          sunrise: prayerTimes.sunrise.toISOString(),
          dhuhr: prayerTimes.dhuhr.toISOString(),
          asr: prayerTimes.asr.toISOString(),
          maghrib: prayerTimes.maghrib.toISOString(),
          isha: prayerTimes.isha.toISOString(),
        },
        formatted: {
          fajr: prayerTimes.fajr.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          sunrise: prayerTimes.sunrise.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          dhuhr: prayerTimes.dhuhr.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          asr: prayerTimes.asr.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          maghrib: prayerTimes.maghrib.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          isha: prayerTimes.isha.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        },
        qibla: qiblaDirection
      }
    });
  } catch (error) {
    console.error('Prayer times error:', error);
    res.status(500).json({ error: 'Failed to calculate prayer times', details: error.message });
  }
});

// @desc    Get next prayer time
// @route   GET /api/prayer/next
// @access  Public
router.get('/next', async (req, res) => {
  try {
    const { lat, lng, method = 'MuslimWorldLeague' } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const coordinates = new adhan.Coordinates(parseFloat(lat), parseFloat(lng));
    let params;
    
    switch (method) {
      case 'MuslimWorldLeague': params = adhan.CalculationMethod.MuslimWorldLeague(); break;
      case 'Egyptian': params = adhan.CalculationMethod.Egyptian(); break;
      case 'Karachi': params = adhan.CalculationMethod.Karachi(); break;
      case 'UmmAlQura': params = adhan.CalculationMethod.UmmAlQura(); break;
      case 'NorthAmerica':
      case 'ISNA': params = adhan.CalculationMethod.NorthAmerica(); break;
      default: params = adhan.CalculationMethod.MuslimWorldLeague();
    }

    const prayerTimes = new adhan.PrayerTimes(coordinates, new Date(), params);
    const currentPrayer = prayerTimes.currentPrayer();
    const nextPrayer = prayerTimes.nextPrayer();
    const nextPrayerTime = prayerTimes.timeForPrayer(nextPrayer);

    res.status(200).json({
      success: true,
      data: {
        current: currentPrayer,
        next: {
          name: nextPrayer,
          time: nextPrayerTime.toISOString(),
          formatted: nextPrayerTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }
      }
    });
  } catch (error) {
    console.error('Next prayer error:', error);
    res.status(500).json({ error: 'Failed to get next prayer', details: error.message });
  }
});

// @desc    Get Qibla direction
// @route   GET /api/prayer/qibla
// @access  Public
router.get('/qibla', async (req, res) => {
  try {
    const { latitude, longitude, lat, lng } = req.query;

    const finalLat = lat || latitude;
    const finalLng = lng || longitude;
    
    if (!finalLat || !finalLng) {
      return res.status(400).json({ error: 'Please provide latitude and longitude' });
    }

    const coordinates = new adhan.Coordinates(parseFloat(finalLat), parseFloat(finalLng));
    const qiblaDirection = adhan.Qibla(coordinates);

    res.status(200).json({
      success: true,
      data: {
        direction: qiblaDirection,
        latitude: parseFloat(finalLat),
        longitude: parseFloat(finalLng),
        formatted: `${qiblaDirection.toFixed(2)}° from North`
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

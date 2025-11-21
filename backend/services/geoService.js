// geoService.js (CommonJS)
const axios = require('axios');

async function getLocationFromIP(ip) {
  try {
    // ipwho.is doesn't rate limit localhost
    const url = `https://ipwho.is/${ip}`;
    const res = await axios.get(url);

    if (!res.data || res.data.success === false) {
      return {
        city: 'Unknown',
        lat: 28.6139,
        lng: 77.2090
      };
    }

    return {
      city: res.data.city || 'Unknown',
      lat: parseFloat(res.data.latitude || res.data.lat || 0),
      lng: parseFloat(res.data.longitude || res.data.lon || res.data.lng || 0)
    };
  } catch (err) {
    console.log('Geo error fallback:', err.message || err);

    // Fallback coords (Delhi)
    return {
      city: 'Unknown',
      lat: 28.6139,
      lng: 77.2090
    };
  }
}

module.exports = { getLocationFromIP };

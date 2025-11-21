const axios = require('axios');

async function getLocationFromIP(ip) {
  try {
    // Use ipapi.co for geolocation
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);

    return {
      city: response.data.city,
      country: response.data.country_name,
      lat: response.data.latitude,
      lng: response.data.longitude
    };
  } catch (error) {
    console.error('Geolocation error:', error);
    // Default location if API fails
    return {
      city: 'Unknown',
      country: 'Unknown',
      lat: 0,
      lng: 0
    };
  }
}

module.exports = {
  getLocationFromIP
};

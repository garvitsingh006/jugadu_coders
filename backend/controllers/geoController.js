const axios = require('axios');
const { getLocationFromIP } = require('../services/geoService');

// Get location from IP
exports.getLocationFromIP = async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
                req.connection.remoteAddress ||
                req.socket.remoteAddress;

    const location = await getLocationFromIP(ip);

    res.json({ location });
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({ error: 'Failed to get location' });
  }
};

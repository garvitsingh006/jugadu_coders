const express = require('express');
const router = express.Router();
const geoController = require('../controllers/geoController');

router.get('/ip', geoController.getLocationFromIP);

module.exports = router;

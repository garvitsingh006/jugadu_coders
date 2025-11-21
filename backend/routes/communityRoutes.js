const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { authenticate } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');

router.post('/search', authenticate, communityController.searchCommunities);
router.post('/create', authenticate, rateLimiter, communityController.createCommunity);
router.get('/nearby', authenticate, communityController.getNearbyCommunities);
router.get('/trending', authenticate, communityController.getTrendingCommunities);
router.get('/:id', authenticate, communityController.getCommunity);
router.post('/:id/join', authenticate, communityController.joinCommunity);
router.post('/suggest', authenticate, communityController.suggestCommunity);

module.exports = router;

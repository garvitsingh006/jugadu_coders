const express = require('express');
const router = express.Router();
const podController = require('../controllers/podController');
const { authenticate } = require('../middleware/auth');

router.post('/create', authenticate, podController.createPod);
router.post('/:id/join', authenticate, podController.joinPod);
router.get('/active', authenticate, podController.getActivePods);
router.get('/:id', authenticate, podController.getPod);

module.exports = router;

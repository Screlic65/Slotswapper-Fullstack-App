const express = require('express');
const router = express.Router();
const swapController = require('../controllers/swapController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all swap-related routes
router.use(authMiddleware);

// GET all swappable slots from other users
router.get('/available', swapController.getSwappableSlots);

// POST a new swap request
router.post('/request', swapController.createSwapRequest);

// GET all pending requests for the logged-in user
router.get('/requests', swapController.getSwapRequests);

// POST a response (accept/reject) to a swap request
router.post('/response/:requestId', swapController.respondToSwapRequest);

module.exports = router;
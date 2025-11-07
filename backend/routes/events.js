const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply the authMiddleware to all routes in this file
router.use(authMiddleware);

// --- Protected Routes ---

// GET all of a user's events & POST a new event
router.route('/')
  .get(eventController.getAllEvents)
  .post(eventController.createEvent);

// PUT (update) a specific event's status
router.route('/:id')
  .put(eventController.updateEventStatus);

module.exports = router;
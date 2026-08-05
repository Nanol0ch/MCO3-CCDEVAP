const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/:flightId', isAuthenticated, bookingController.getBookingPage);
router.get('/api/flights/:id/occupied-seats',isAuthenticated, bookingController.getOccupiedSeats);
router.post('/', isAuthenticated, bookingController.submitBooking);

module.exports = router;


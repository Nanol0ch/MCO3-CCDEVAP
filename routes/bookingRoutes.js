const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/api/flights/:id/occupied-seats', isAuthenticated, bookingController.getOccupiedSeats);
router.get('/:flightId', isAuthenticated, bookingController.getBookingPage);
router.post('/', isAuthenticated, bookingController.submitBooking);

module.exports = router;


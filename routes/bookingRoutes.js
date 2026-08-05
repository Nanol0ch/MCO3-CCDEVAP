const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.get('/:flightId', bookingController.getBookingPage);
router.get('/api/flights/:id/occupied-seats', bookingController.getOccupiedSeats);
router.post('/', bookingController.submitBooking);

module.exports = router;


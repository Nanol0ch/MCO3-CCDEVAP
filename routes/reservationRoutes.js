const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/', isAuthenticated, reservationController.getMyReservations);
router.patch('/:id/seat', isAuthenticated, reservationController.updateSeat);
router.delete('/:id', isAuthenticated, reservationController.cancelReservation);

module.exports = router;


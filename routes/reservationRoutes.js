const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

router.get('/', reservationController.getMyReservations);
router.patch('/:id/seat', reservationController.updateSeat);
router.delete('/:id', reservationController.cancelReservation);

module.exports = router;


const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/', adminController.getDashboard);
router.get('/users', adminController.getUsersPage);

router.get('/flights', adminController.getFlights);
router.post('/flights', adminController.createFlight);
router.put('/flights/:id', adminController.updateFlight);
router.delete('/flights/:id', adminController.deleteFlight);

router.get('/reservations', adminController.getAllReservations);
router.patch('/reservations/:id/status', adminController.updateReservationStatus);

module.exports = router;


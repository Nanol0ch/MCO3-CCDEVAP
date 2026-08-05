const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

router.get('/', isAuthenticated, isAdmin, adminController.getDashboard);
router.get('/users', isAuthenticated, isAdmin, adminController.getUsersPage);

router.get('/flights', isAuthenticated, isAdmin, adminController.getFlights);
router.post('/flights', isAuthenticated, isAdmin, adminController.createFlight);
router.put('/flights/:id', isAuthenticated, isAdmin, adminController.updateFlight);
router.delete('/flights/:id', isAuthenticated, isAdmin, adminController.deleteFlight);

router.get('/reservations', isAuthenticated, isAdmin, adminController.getAllReservations);
router.patch('/reservations/:id/status', isAuthenticated, isAdmin, adminController.updateReservationStatus);

router.get('/audit-logs', isAuthenticated, isAdmin, adminController.getAuditLogs);

module.exports = router;


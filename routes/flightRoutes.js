const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/search', isAuthenticated, flightController.getSearchPage);
router.get('/search/results', isAuthenticated, flightController.searchFlights);
router.get('/:id', isAuthenticated, flightController.getFlightById);

module.exports = router;


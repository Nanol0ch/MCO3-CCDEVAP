const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');

router.get('/search', flightController.getSearchPage);
router.get('/search/results', flightController.searchFlights);
router.get('/:id', flightController.getFlightById);

module.exports = router;


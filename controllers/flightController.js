const Flight = require('../models/flight');

const getSearchPage = (req, res) => {
    res.render('search');
};

const searchFlights = async (req, res) => {
    try {
        const { origin, destination, date } = req.query;

        if (!origin || !destination || !date) {
            return res.status(400).json({ 
                error: 'Origin, destination, and date are required.' 
            });
        }

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const query = {
            origin: origin,
            destination: destination,
            departure: {
                $gte: startOfDay,
                $lte: endOfDay
            },
            seats: { $gt: 0 }
        };

        const flights = await Flight.find(query);

        res.status(200).json(flights);

    } catch (err) {
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
};

const getFlightById = async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id);

        if (!flight) {
            return res.status(404).json({ error: 'Flight not found.' });
        }

        res.render('flight-details', { flight: flight.toObject() });

    } catch (err) {
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
};

module.exports = { getSearchPage, searchFlights, getFlightById };


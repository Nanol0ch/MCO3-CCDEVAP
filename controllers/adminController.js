const Flight = require('../models/flight');
const Reservation = require('../models/reservation');
const User = require('../models/user');
const AuditLog = require('../models/auditLog');

// GET /admin
exports.getDashboard = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('/login');
        }

        const flightCount = await Flight.countDocuments();
        const reservationCount = await Reservation.countDocuments();

        res.render('admin-dashboard', {
            flightCount: flightCount,
            reservationCount: reservationCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// GET /admin/users
exports.getUsersPage = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('/login');
        }

        const users = await User.find().lean();

        res.render('admin-users', { users: users });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// GET /admin/flights
exports.getFlights = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('/login');
        }

        const flights = await Flight.find().lean();

        const formatted = flights.map(f => ({
            _id: f._id,
            flightNumber: f.flightNumber,
            airline: f.airline,
            origin: f.origin,
            destination: f.destination,
            departure: new Date(f.departure).toLocaleString(),
            seats: f.seats,
            price: f.price
        }));

        res.render('admin-flights', { flights: formatted });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// POST /admin/flights
exports.createFlight = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Please log in first.' });
        }

        const { flightNumber, airline, origin, destination, departure, arrival, seats, price } = req.body;

        if (!flightNumber || !airline || !origin || !destination || !departure || !arrival || !seats || !price) {
            return res.status(400).json({ error: 'All flight fields are required.' });
        }

        const newFlight = await Flight.create({
            flightNumber,
            airline,
            origin,
            destination,
            departure,
            arrival,
            seats,
            price
        });

        await AuditLog.create({
            username: req.session.userName || 'Admin',
            role: req.session.user?.role || 'admin',
            activity: `Created flight ${newFlight.flightNumber}`
        });

        res.json(newFlight);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
};

// PUT /admin/flights/:id
exports.updateFlight = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Please log in first.' });
        }

        if (!req.body.price) {
            return res.status(400).json({ error: 'Price is required.' });
        }

        const updatedFlight = await Flight.findByIdAndUpdate(
            req.params.id,
            { price: req.body.price },
            { new: true }
        );

        if (!updatedFlight) {
            return res.status(404).json({ error: 'Flight not found.' });
        }

        await AuditLog.create({
            username: req.session.userName || 'Admin',
            role: req.session.user?.role || 'admin',
            activity: `Updated flight ${updatedFlight.flightNumber}`
        });

        res.json(updatedFlight);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
};

// DELETE /admin/flights/:id
exports.deleteFlight = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Please log in first.' });
        }

        const deletedFlight = await Flight.findByIdAndDelete(req.params.id);

        if (!deletedFlight) {
            return res.status(404).json({ error: 'Flight not found.' });
        }

        await AuditLog.create({
            username: req.session.userName || 'Admin',
            role: req.session.user?.role || 'admin',
            activity: `Deleted flight ${deletedFlight.flightNumber}`
        });

        res.json({ deleted: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
};

// GET /admin/reservations
exports.getAllReservations = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('/login');
        }

        const reservations = await Reservation.find().populate('flightId').lean();

        const formatted = reservations.map(r => ({
            _id: r._id,
            reservationNumber: r.reservationNumber,
            passengerName: r.passengerName,
            route: r.flightId ? (r.flightId.origin + ' - ' + r.flightId.destination) : '',
            confirmedSelected: r.status === 'Confirmed' ? 'selected' : '',
            cancelledSelected: r.status === 'Cancelled' ? 'selected' : ''
        }));

        res.render('admin-reservations', { reservations: formatted });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// PATCH /admin/reservations/:id/status
exports.updateReservationStatus = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Please log in first.' });
        }

        if (!['Confirmed', 'Cancelled'].includes(req.body.status)) {
            return res.status(400).json({ error: 'Invalid status.' });
        }

        const updatedReservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );

        if (!updatedReservation) {
            return res.status(404).json({ error: 'Reservation not found.' });
        }

        res.json(updatedReservation);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
};

// GET /admin/audit-logs
exports.getAuditLogs = async (req, res) => {
    try {
        if (!req.session.userId || req.session.user?.role !== 'admin') {
            return res.status(403).send('Access Denied');
        }

        const logs = await AuditLog.find().sort({ timestamp: -1 }).lean();

        const formattedLogs = logs.map(log => ({
            username: log.username,
            role: log.role,
            activity: log.activity,
            timestamp: log.timestamp.toLocaleString()
        }));

        res.render('audit-log', { logs: formattedLogs });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

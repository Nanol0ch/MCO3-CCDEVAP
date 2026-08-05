const Reservation = require('../models/reservation');
const User = require('../models/user');

// GET /reservations
exports.getMyReservations = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('/login');
        }

        const user = await User.findById(req.session.userId);
        const reservations = await Reservation.find({ email: user.email }).populate('flightId');

        const formatted = reservations.map(r => ({
            _id: r._id,
            reservationNumber: r.reservationNumber,
            passengerName: r.passengerName,
            seat: r.seat,
            totalPrice: r.totalPrice,
            status: r.status,
            statusClass: r.status === 'Confirmed' ? 'bg-success' : 'bg-danger',
            disabledClass: r.status === 'Cancelled' ? 'disabled' : '',
            flightNumber: r.flightId ? r.flightId.flightNumber : '',
            route: r.flightId ? (r.flightId.origin + ' - ' + r.flightId.destination) : '',
            departure: r.flightId ? new Date(r.flightId.departure).toLocaleString() : ''
        }));

        res.render('reservations', { reservations: formatted });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// PATCH /reservations/:id/seat
exports.updateSeat = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Please log in first.' });
        }

        if (!req.body.seat) {
            return res.status(400).json({ error: 'Seat is required.' });
        }

        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found.' });
        }

        const newSeat = req.body.seat.toUpperCase();

        const seatTaken = await Reservation.findOne({
            flightId: reservation.flightId,
            seat: newSeat,
            status: 'Confirmed',
            _id: { $ne: reservation._id }
        });

        if (seatTaken) {
            return res.status(400).json({ error: 'That seat is already taken.' });
        }

        reservation.seat = newSeat;
        await reservation.save();

        res.json(reservation);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
};

// DELETE /reservations/:id
exports.cancelReservation = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Please log in first.' });
        }

        const reservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            { status: 'Cancelled' },
            { new: true }
        );

        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found.' });
        }

        res.json(reservation);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
};

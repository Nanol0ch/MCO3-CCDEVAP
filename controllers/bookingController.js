const Reservation = require('../models/reservation');
const Flight = require('../models/flight'); 
const AuditLog = require('../models/auditLog');

// Booking Controller Object
const bookingController = {
    
    // Render Booking Page
    getBookingPage: async (req, res) => {
        try {
            const flight = await Flight.findById(req.params.flightId).lean();
            if (!flight) return res.status(404).send("Flight not found");
            res.render('booking', { flight: flight });
        } catch (err) {
            res.status(500).send("Server Error");
        }
    },

    // AJAX Endpoint: Get Occupied Seats
    getOccupiedSeats: async (req, res) => {
        try {
            const bookings = await Reservation.find({ 
                flightId: req.params.id, 
                status: "Confirmed" 
            });
            const occupiedSeats = bookings.map(b => b.seat);
            res.json(occupiedSeats);
        } catch (err) {
            res.status(500).json({ error: "Server Error" });
        }
    },

    // POST Route: Submit Booking
    submitBooking: async (req, res) => {
        try {
            const { flightId, passengerName, passportNumber, seat, totalPrice } = req.body;
            const email = req.session.user?.email || req.body.email;

            // Server-Side Validation
            if (!passengerName || !email || !passportNumber || !seat) {
                return res.status(400).json({ error: "All passenger fields are required." });
            }

            const flight = await Flight.findById(flightId);

            // Business Rules Validation[cite: 18]
            if (flight.seats <= 0) {
                return res.status(400).json({ error: "Flight is fully booked." });
            }

            const existingSeat = await Reservation.findOne({ flightId: flightId, seat: seat, status: "Confirmed" });
            if (existingSeat) {
                return res.status(400).json({ error: "Seat is already taken." });
            }

            const bookingRef = "SKY-" + Math.floor(Math.random() * 900000 + 100000);

            const newReservation = new Reservation({
                reservationNumber: bookingRef,
                flightId: flightId,
                passengerName: passengerName,
                email: email,
                passportNumber: passportNumber,
                seat: seat,
                totalPrice: totalPrice,
                status: "Confirmed"
            });

            await newReservation.save();

            // Decrement seats[cite: 18]
            flight.seats -= 1;
            await flight.save();

            await AuditLog.create({
                username: req.session.userName || passengerName,
                role: req.session.user?.role || 'Passenger',
                activity: `Created reservation ${bookingRef} for flight ${flight.flightNumber}`
            });

            res.status(200).json({ message: "Booking successful!", reference: bookingRef });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
};

module.exports = bookingController;

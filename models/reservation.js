// models/Reservation.js
const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    reservationNumber: { type: String, required: true, unique: true },
    flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    passengerName: { type: String, required: true },
    email: { type: String, required: true },
    passportNumber: { type: String, required: true },
    seat: { type: String, required: true },
    totalPrice: { type: String }, // Storing as string to match M1 UI format
    status: { type: String, enum: ["Confirmed", "Cancelled"], default: "Confirmed" }
});

module.exports = mongoose.model('Reservation', reservationSchema);


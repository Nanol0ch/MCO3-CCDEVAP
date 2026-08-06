const mongoose = require('mongoose');
const Flight = require('../models/flight');
const Reservation = require('../models/reservation');

beforeAll(async () => {
    const testUri = (process.env.MONGO_URI || 'mongodb://localhost:27017/airroute').replace('/airroute', '/airroute_test');
    await mongoose.connect(testUri);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

afterEach(async () => {
    await Reservation.deleteMany({});
    await Flight.deleteMany({});
});

describe('Reservation Management', () => {

    test('Create Reservation', async () => {
        const flight = await Flight.create({
            flightNumber: 'PR 101',
            airline: 'Philippine Airlines',
            origin: 'MNL',
            destination: 'SIN',
            departure: new Date('2026-08-01T06:00:00'),
            arrival: new Date('2026-08-01T09:45:00'),
            seats: 12,
            price: 4500
        });
        const reservation = await Reservation.create({
            reservationNumber: 'SKY-123456',
            flightId: flight._id,
            passengerName: 'Roshni Pathak',
            email: 'roshni@email.com',
            passportNumber: 'A1234567',
            seat: '1A',
            status: 'Confirmed'
        });
        expect(reservation.reservationNumber).toBe('SKY-123456');
        expect(reservation.status).toBe('Confirmed');
    });

    test('Cancel Reservation', async () => {
        const flight = await Flight.create({
            flightNumber: 'PR 101',
            airline: 'Philippine Airlines',
            origin: 'MNL',
            destination: 'SIN',
            departure: new Date('2026-08-01T06:00:00'),
            arrival: new Date('2026-08-01T09:45:00'),
            seats: 12,
            price: 4500
        });
        const reservation = await Reservation.create({
            reservationNumber: 'SKY-123456',
            flightId: flight._id,
            passengerName: 'Roshni Pathak',
            email: 'roshni@email.com',
            passportNumber: 'A1234567',
            seat: '1A',
            status: 'Confirmed'
        });
        const cancelled = await Reservation.findByIdAndUpdate(
            reservation._id,
            { status: 'Cancelled' },
            { new: true }
        );
        expect(cancelled.status).toBe('Cancelled');
    });

});

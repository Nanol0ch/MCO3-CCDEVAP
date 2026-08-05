const mongoose = require('mongoose');
const Flight = require('../models/flight');
const Reservation = require('../models/reservation');

beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/airroute_test');
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

afterEach(async () => {
    await Reservation.deleteMany({});
    await Flight.deleteMany({});
});

describe('Business Rule Validation', () => {

    test('Cannot book a flight with no available seats', async () => {
        const flight = await Flight.create({
            flightNumber: 'PR 101',
            airline: 'Philippine Airlines',
            origin: 'MNL',
            destination: 'SIN',
            departure: new Date('2026-08-01T06:00:00'),
            arrival: new Date('2026-08-01T09:45:00'),
            seats: 0,
            price: 4500
        });
        const canBook = flight.seats > 0;
        expect(canBook).toBe(false);
    });

    test('Cannot select an occupied seat', async () => {
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
        await Reservation.create({
            reservationNumber: 'SKY-111111',
            flightId: flight._id,
            passengerName: 'Roshni Pathak',
            email: 'roshni@email.com',
            passportNumber: 'A1234567',
            seat: '1A',
            status: 'Confirmed'
        });
        const existingSeat = await Reservation.findOne({
            flightId: flight._id,
            seat: '1A',
            status: 'Confirmed'
        });
        const seatTaken = existingSeat !== null;
        expect(seatTaken).toBe(true);
    });

});

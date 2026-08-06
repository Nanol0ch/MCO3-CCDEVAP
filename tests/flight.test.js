const mongoose = require('mongoose');
const Flight = require('../models/flight');

beforeAll(async () => {
    const testUri = (process.env.MONGO_URI || 'mongodb://localhost:27017/airroute').replace('/airroute', '/airroute_test');
    await mongoose.connect(testUri);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

afterEach(async () => {
    await Flight.deleteMany({});
});

describe('Flight Management', () => {

    test('Create Flight', async () => {
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
        expect(flight.flightNumber).toBe('PR 101');
        expect(flight.seats).toBe(12);
    });

    test('Update Flight', async () => {
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
        const updated = await Flight.findByIdAndUpdate(
            flight._id,
            { price: 5000 },
            { new: true }
        );
        expect(updated.price).toBe(5000);
    });

    test('Delete Flight', async () => {
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
        await Flight.findByIdAndDelete(flight._id);
        const deleted = await Flight.findById(flight._id);
        expect(deleted).toBeNull();
    });

});

const mongoose = require('mongoose');
const Flight = require('./models/flight');
const db = require('./db');

const flights = [
    {
        flightNumber: 'PR 101',
        airline: 'Philippine Airlines',
        origin: 'MNL',
        destination: 'SIN',
        departure: new Date('2026-08-01T06:00:00'),
        arrival: new Date('2026-08-01T09:45:00'),
        seats: 12,
        price: 4500
    },
    {
        flightNumber: '5J 210',
        airline: 'Cebu Pacific',
        origin: 'MNL',
        destination: 'HKG',
        departure: new Date('2026-08-01T08:30:00'),
        arrival: new Date('2026-08-01T11:10:00'),
        seats: 5,
        price: 3200
    },
    {
        flightNumber: 'Z2 305',
        airline: 'AirAsia',
        origin: 'CEB',
        destination: 'SIN',
        departure: new Date('2026-08-01T13:15:00'),
        arrival: new Date('2026-08-01T17:00:00'),
        seats: 20,
        price: 6800
    },
    {
        flightNumber: 'QR 928',
        airline: 'Qatar Airways',
        origin: 'MNL',
        destination: 'DXB',
        departure: new Date('2026-08-01T22:00:00'),
        arrival: new Date('2026-08-02T04:30:00'),
        seats: 8,
        price: 18500
    },
    {
        flightNumber: 'EK 333',
        airline: 'Emirates',
        origin: 'MNL',
        destination: 'DXB',
        departure: new Date('2026-08-02T01:00:00'),
        arrival: new Date('2026-08-02T06:15:00'),
        seats: 3,
        price: 22000
    },
    {
        flightNumber: 'PR 504',
        airline: 'Philippine Airlines',
        origin: 'MNL',
        destination: 'NRT',
        departure: new Date('2026-08-02T10:00:00'),
        arrival: new Date('2026-08-02T15:30:00'),
        seats: 15,
        price: 12000
    },
    {
        flightNumber: '5J 820',
        airline: 'Cebu Pacific',
        origin: 'DVO',
        destination: 'MNL',
        departure: new Date('2026-08-02T07:45:00'),
        arrival: new Date('2026-08-02T09:15:00'),
        seats: 30,
        price: 2100
    },
    {
        flightNumber: 'Z2 614',
        airline: 'AirAsia',
        origin: 'MNL',
        destination: 'SYD',
        departure: new Date('2026-08-02T15:00:00'),
        arrival: new Date('2026-08-03T06:30:00'),
        seats: 10,
        price: 15000
    },
    {
        flightNumber: 'EK 219',
        airline: 'Emirates',
        origin: 'MNL',
        destination: 'DXB',
        departure: new Date('2026-08-02T19:30:00'),
        arrival: new Date('2026-08-03T01:00:00'),
        seats: 2,
        price: 35000
    },
    {
        flightNumber: 'QR 412',
        airline: 'Qatar Airways',
        origin: 'CEB',
        destination: 'HKG',
        departure: new Date('2026-08-02T11:00:00'),
        arrival: new Date('2026-08-02T13:30:00'),
        seats: 18,
        price: 7500
    }
];

const seed = async () => {
    await db.connect();
    await Flight.deleteMany({});
    await Flight.insertMany(flights);
    console.log('Flights seeded successfully');
    mongoose.connection.close();
}

seed();


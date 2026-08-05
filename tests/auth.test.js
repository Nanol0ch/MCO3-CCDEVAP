const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');

beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/airroute_test');
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

afterEach(async () => {
    await User.deleteMany({});
});

describe('User Authentication', () => {

    test('Successful registration', async () => {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await User.create({
            name: 'Test User',
            email: 'test@email.com',
            password: hashedPassword,
            passportNumber: 'A1234567',
            nationality: 'Filipino',
            dateOfBirth: new Date('2000-01-01')
        });
        expect(user.email).toBe('test@email.com');
        expect(user.name).toBe('Test User');
    });

    test('Successful login', async () => {
        const hashedPassword = await bcrypt.hash('password123', 10);
        await User.create({
            name: 'Test User',
            email: 'test@email.com',
            password: hashedPassword,
            passportNumber: 'A1234567',
            nationality: 'Filipino',
            dateOfBirth: new Date('2000-01-01')
        });
        const user = await User.findOne({ email: 'test@email.com' });
        const isMatch = await bcrypt.compare('password123', user.password);
        expect(isMatch).toBe(true);
    });

    test('Failed login with wrong password', async () => {
        const hashedPassword = await bcrypt.hash('password123', 10);
        await User.create({
            name: 'Test User',
            email: 'test@email.com',
            password: hashedPassword,
            passportNumber: 'A1234567',
            nationality: 'Filipino',
            dateOfBirth: new Date('2000-01-01')
        });
        const user = await User.findOne({ email: 'test@email.com' });
        const isMatch = await bcrypt.compare('wrongpassword', user.password);
        expect(isMatch).toBe(false);
    });

});

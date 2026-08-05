const bcrypt = require('bcrypt');
const User = require('../models/User');

// GET /register
exports.getRegisterPage = (req, res) => {
    res.render('register');
};

// POST /register
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, passportNumber, nationality, dateOfBirth } = req.body;

        // Server-side validation: required fields
        if (!name || !email || !password || !passportNumber || !nationality || !dateOfBirth) {
            return res.render('register', { error: 'All fields are required.' });
        }

        // Server-side validation: email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.render('register', { error: 'Please enter a valid email address.' });
        }

        // Server-side validation: duplicate email
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.render('register', { error: 'An account with this email already exists.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
            passportNumber,
            nationality,
            dateOfBirth
        });

        res.redirect('/login');

    } catch (err) {
        console.error(err);
        res.render('register', { error: 'Something went wrong. Please try again.' });
    }
};

// GET /login
exports.getLoginPage = (req, res) => {
    res.render('login');
};

// POST /login
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.render('login', { error: 'Email and password are required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.render('login', { error: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { error: 'Invalid email or password.' });
        }

        // Create session
        req.session.userId = user._id;
        req.session.userName = user.name;

        res.redirect('/profile');

    } catch (err) {
        console.error(err);
        res.render('login', { error: 'Something went wrong. Please try again.' });
    }
};

// GET /logout
exports.logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error(err);
        res.redirect('/login');
    });
};

// GET /
exports.getHomePage = async (req, res) => {
    try {
        const Flight = require('../models/flight');
        const Reservation = require('../models/reservation');
        const flightCount = await Flight.countDocuments();
        const bookingCount = await Reservation.countDocuments();
        const flights = await Flight.find().lean();
        res.render('home_dashboard', { flightCount, bookingCount, flights });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// GET /profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.redirect('/login');

        res.render('profile', { user });
    } catch (err) {
        console.error(err);
        res.redirect('/login');
    }
};

// POST /profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, passportNumber, nationality, dateOfBirth } = req.body;

        if (!name || !email || !passportNumber || !nationality || !dateOfBirth) {
            const user = await User.findById(req.session.userId);
            return res.render('profile', { user, error: 'All fields are required.' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            const user = await User.findById(req.session.userId);
            return res.render('profile', { user, error: 'Please enter a valid email address.' });
        }

        // Duplicate check, excluding current user
        const existingUser = await User.findOne({
            email: email.toLowerCase(),
            _id: { $ne: req.session.userId }
        });
        if (existingUser) {
            const user = await User.findById(req.session.userId);
            return res.render('profile', { user, error: 'That email is already in use by another account.' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.session.userId,
            { name, email, passportNumber, nationality, dateOfBirth },
            { new: true }
        );

        req.session.userName = updatedUser.name;

        res.render('profile', { user: updatedUser, success: 'Profile updated successfully.' });

    } catch (err) {
        console.error(err);
        res.redirect('/profile');
    }
};

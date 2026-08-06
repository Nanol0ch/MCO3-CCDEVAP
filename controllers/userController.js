const User = require('../models/user');

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
        const user = await User.findById(req.session.userId).lean();
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
            const user = await User.findById(req.session.userId).lean();
            return res.render('profile', { user, error: 'All fields are required.' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            const user = await User.findById(req.session.userId).lean();
            return res.render('profile', { user, error: 'Please enter a valid email address.' });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase(),
            _id: { $ne: req.session.userId }
        });
        if (existingUser) {
            const user = await User.findById(req.session.userId).lean();
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

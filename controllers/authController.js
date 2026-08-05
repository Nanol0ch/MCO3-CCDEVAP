const bcrypt = require('bcrypt');
const User = require('../models/User');
const AuditLog = require('../models/auditLog');

// GET /register
exports.getRegisterPage = (req, res) => {
    res.render('register');
};

// POST /register
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, passportNumber, nationality, dateOfBirth } = req.body;

        // Required fields
        if (!name || !email || !password || !passportNumber || !nationality || !dateOfBirth) {
            return res.render('register', { error: 'All fields are required.' });
        }

        // Email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.render('register', { error: 'Please enter a valid email address.' });
        }

        // Duplicate email
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

        await AuditLog.create({
            username: name,
            role: 'Passenger',
            activity: 'Registered a new account'
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

        req.session.userId = user._id;
        req.session.userName = user.name;
        
        req.session.user = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        await AuditLog.create({
            username: user.name,
            role: user.role || 'Passenger',
            activity: 'Logged into the system'
        });

        res.redirect('/profile');

    } catch (err) {
        console.error(err);
        res.render('login', { error: 'Something went wrong. Please try again.' });
    }
};

// GET /logout
exports.logoutUser = (req, res) => {

    if (req.session.userName) {
    await AuditLog.create({
        username: req.session.userName,
        role: req.session.role || 'Passenger',
        activity: 'Logged out of the system'
        });
    }    
    
    req.session.destroy((err) => {
        if (err) console.error(err);
        res.redirect('/login');
    });
};


require('dotenv').config();

const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const db = require('./db');

const app = express();

db.connect();

app.engine('hbs', exphbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    helpers: {
        json: function(context) {
            return JSON.stringify(context);
        },
        eq: function(a, b) {
            return a === b;
        }
    }
}));
app.set('view engine', 'hbs');
app.set('views', './views');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'airroute',
    resave: false,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

app.use('/', require('./routes/authRoutes'));
app.use('/flights', require('./routes/flightRoutes'));
app.use('/bookings', require('./routes/bookingRoutes'));
app.use('/reservations', require('./routes/reservationRoutes'));
app.use('/admin', require('./routes/adminRoutes'));

const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

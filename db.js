const mongoose = require('mongoose');

// Uses MONGO_URI from the environment when set (e.g. on CCSCloud in production),
// falling back to a local MongoDB instance for development.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/airroute';

const connect = () => {
    return mongoose.connect(MONGO_URI);
}

module.exports = { connect };


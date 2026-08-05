const mongoose = require('mongoose');

// Production (CCSCloud/Coolify): set MONGO_URI in the deployment environment.
// Local development falls back to localhost.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/airroute';

const connect = () => {
    return mongoose.connect(MONGO_URI);
};

module.exports = { connect };

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    username: { type: String, required: true },
    role: { type: String, required: true },
    activity: { type: String, required: true }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);

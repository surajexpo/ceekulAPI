const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true,
        unique: true
    },
    otp: {
        type: Number,
        required: true
    },
    expiryTime: {
        type: Date,
        required: true
    },
    wrongAttampts: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    collection: 'OTPModel'
});

// Index for automatic cleanup of expired OTPs
otpSchema.index({ expiryTime: 1 }, { expireAfterSeconds: 0 });

const OTPModel = mongoose.model('OTPModel', otpSchema);
module.exports = OTPModel;
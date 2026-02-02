const verifyAccessToken = require('./verifyAccessToken.js');
const sendOtpToPhone = require('./sendOtpToPhone.js');
const getOtp = require('./getOtp.js');
const generateToken = require('./generateToken.js');
const { generateCeebrainId, generateCeebrainIdSync } = require('./generateCeebrainId.js');

module.exports = {
    verifyAccessToken,
    sendOtpToPhone,
    getOtp,
    generateToken,
    generateCeebrainId,
    generateCeebrainIdSync,
};

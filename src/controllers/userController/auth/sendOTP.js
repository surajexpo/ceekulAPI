const { OTPModel } = require('../../../models/authModels');
const { sendOtpToPhone } = require('../../../utils');

const sendOTP = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    // Support both 'mobileNumber' and 'number' for backward compatibility
    const number = mobileNumber || req.body.number;

    if (!number) {
      return res.status(400).json({
        status: false,
        message: "Mobile number is required"
      });
    }

    // Validate Indian mobile number format
    if (!/^[6-9][0-9]{9}$/.test(number)) {
      return res.status(400).json({
        status: false,
        message: "Invalid mobile number format. Must be a valid 10-digit Indian mobile number."
      });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000);

    // Set expiry time (10 minutes from now)
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000);

    // Find existing OTP record or create new one
    const existingOtp = await OTPModel.findOne({ number });

    if (existingOtp) {
      // Update existing OTP record
      existingOtp.otp = otp;
      existingOtp.expiryTime = expiryTime;
      existingOtp.wrongAttampts = 0;
      await existingOtp.save();
    } else {
      // Create new OTP record
      const newOtpRecord = new OTPModel({
        number,
        otp,
        expiryTime,
        wrongAttampts: 0
      });
      await newOtpRecord.save();
    }

    // Send OTP to phone number
    await sendOtpToPhone(number, otp);

    return res.status(200).json({
      status: true,
      message: "OTP sent successfully",
      expiresIn: "10 minutes"
    });

  } catch (error) {
    console.error("SendOTP Error:", error.message);
    return res.status(500).json({
      status: false,
      message: "Failed to send OTP. Please try again."
    });
  }
};

module.exports = sendOTP;

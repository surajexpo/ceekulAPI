const { Admin } = require('../../../models/authModels');

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        const currentTime = Date.now();
        // Check if OTP is expired
        if (admin.resetOtpExpiry < currentTime) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        if (admin.otp !== otp) {

            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // OTP is valid, proceed with password reset or any other action
        return res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
module.exports = verifyOTP;
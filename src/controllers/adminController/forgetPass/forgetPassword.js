const nodemailer = require('nodemailer');
const { Admin } = require('../../../models/authModels');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // or your SMTP host (e.g., "smtp.mailgun.org")
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_EMAIL,      // your email
        pass: process.env.SMTP_PASSWORD,   // your email password or app password
    },
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: "Email is not registered with us" });
        }

        // Generate OTP
        const otp = generateOTP();

        // Send email
        await transporter.sendMail({
            from: `"Your App Name" <${process.env.SMTP_EMAIL}>`,
            to: email,
            subject: "Reset Password - OTP",
            html: `<p>Your OTP for password reset is <b>${otp}</b>. It is valid for 10 minutes.</p>`
        });

        // Optionally: Save OTP to DB or cache (e.g. Redis), with expiry
        admin.resetOtp = otp;
        admin.resetOtpExpiry = Date.now() + 10 * 60 * 1000;
        await admin.save();

        return res.status(200).json({ message: "OTP sent successfully" });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = forgetPassword;

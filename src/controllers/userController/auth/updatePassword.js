const { User } = require("../../../models/authModels");

const changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: false,
        message: "Current password and new password are required."
      });
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        status: false,
        message: "New password must be at least 8 characters long."
      });
    }

    // Find user with password field (since it's excluded by default)
    const user = await User.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found."
      });
    }

    // Check if user has password-based auth
    if (user.authProvider === 'MOBILE_OTP') {
      return res.status(400).json({
        status: false,
        message: "Password change is not available for mobile OTP users. Please add email authentication first."
      });
    }

    // Check if account is suspended
    if (user.status === 'Suspended') {
      return res.status(403).json({
        status: false,
        message: "Your account has been suspended."
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({
        status: false,
        message: "Account is temporarily locked. Please try again later."
      });
    }

    // Compare current password using model method
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      await user.incrementLoginAttempts();
      return res.status(401).json({
        status: false,
        message: "Current password is incorrect."
      });
    }

    // Reset login attempts
    await user.resetLoginAttempts();

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Password changed successfully."
    });

  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({
      status: false,
      message: "Server error while changing password."
    });
  }
};

module.exports = changePassword;

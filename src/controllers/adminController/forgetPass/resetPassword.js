const { Admin } = require('../../../models/authModels');
const bcrypt = require('bcrypt');

const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ message: 'Email and new password are required' });
        }

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // Update the password
        admin.password = hashedPassword;
        await admin.save();

        return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = resetPassword;
const { Admin } = require("../../../models/authModels");
const { generateToken } = require("../../../utils");
const bcrypt = require("bcrypt");
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({
                status: false,
                message: "Email and password are required",
            });
        }

        // Find the admin by email
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({
                status: false,
                message: "Invalid email",
            });
        }
        if (admin.status === false) {
            return res.status(401).json({
                status: false,
                message: "Your account is blocked",
            });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({
                status: false,
                message: "Invalid password",
            });
        }

        // Generate a token (you can use JWT or any other method)
        const token = await generateToken(admin._id, admin.role);

        return res.status(200).json({
            status: true,
            message: "Login successful",
            token,
            admin,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
}

module.exports = login;
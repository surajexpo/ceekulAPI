const { Admin } = require("../../../models/authModels");

const register = async (req, res) => {
    try {
        const mustData = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            number: req.body.number,
            role: req.body.role || 'admin',
        }

        for (const key in mustData) {
            if (!mustData[key] || mustData[key] === "") {
                return res.status(400).json({
                    status: false,
                    message: `${key} is required`,
                });
            }
        }

        // Check if admin with email already exists
        const existingAdmin = await Admin.findOne({ email: mustData.email });
        if (existingAdmin) {
            return res.status(400).json({
                status: false,
                message: "Admin with this email already exists",
            });
        }

        // Password will be hashed by pre-save hook in AdminModel
        const newAdmin = new Admin(mustData);
        await newAdmin.save();

        return res.status(201).json({
            status: true,
            message: "Admin registered successfully",
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
}

module.exports = register;
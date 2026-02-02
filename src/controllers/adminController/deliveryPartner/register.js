const { Admin } = require("../../../models/authModels");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
    try {
        const body = req.body;
        for (const key in body) {
            if (!body[key] || body[key] === "") {
                return res.status(400).json({ status: false, message: `${key} is required` });
            }
        }

        // Check if the user already exists
        const existingUser = await Admin.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: false, message: "Email already exists" });
        }

        const existingNumber = await Admin.findOne({ number });
        if (existingNumber) {
            return res.status(400).json({ status: false, message: "Number already exists" });
        }

        // Hash the password
        if (body.password) {
            const hashedPassword = await bcrypt.hash(body.password, 10);
            body.password = hashedPassword;
        }
        // Create a new user
        const newUser = new Admin(body);

        await newUser.save();
        return res.status(201).json({ status: true, message: "User registered successfully", user: newUser });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
}
module.exports = register;
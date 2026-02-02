const { Admin } = require("../../../models/authModels");
const bcrypt = require("bcrypt");
const update = async (req, res) => {
    try {
        const role = req.admin.role;
        if (role !== "admin") {
            return res.status(403).json({ message: "Permission denied" });
        }
        
        const { id, password, name, status } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Admin ID is required" });
        }
        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        const newAdmin = {}
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            newAdmin.password = hashedPassword;
        }
        if (name) {
            newAdmin.name = name;
        }
        if (status) {
            newAdmin.status = status;
        }
        await Admin.findOneAndUpdate({ _id: id }, newAdmin, { new: true });
        return res.status(200).json({ message: "updated successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = update;
const profile = async (req, res) => {
    try {
        const admin = req.admin;
        if (!admin) {
            return res.status(404).json({
                status: false,
                message: "Admin not found",
            });
        }
        return res.status(200).json({
            status: true,
            message: "Admin profile retrieved successfully",
            data: admin,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
}

module.exports = profile;
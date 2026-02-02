const { User } = require("../../../models/authModels");

const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      verificationStatus,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter = {};

    // Search across multiple fields
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobileNumber: { $regex: search, $options: "i" } },
        { ceebrainId: { $regex: search, $options: "i" } },
        { "address.city": { $regex: search, $options: "i" } },
        { "address.state": { $regex: search, $options: "i" } }
      ];
    }

    // Filter by status
    if (status && ['Active', 'Inactive', 'Suspended'].includes(status)) {
      filter.status = status;
    }

    // Filter by verification status
    if (verificationStatus && ['Pending', 'Verified', 'Rejected'].includes(verificationStatus)) {
      filter.verificationStatus = verificationStatus;
    }

    // Build sort
    const sortOptions = {};
    const validSortFields = ['createdAt', 'updatedAt', 'fullName', 'email'];
    if (validSortFields.includes(sortBy)) {
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions.createdAt = -1;
    }

    // Fetch users
    const users = await User.find(filter)
      .select("-password")
      .skip(skip)
      .limit(limitNum)
      .sort(sortOptions);

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limitNum);

    // Format user responses
    const formattedUsers = users.map(user => ({
      _id: user._id,
      ceebrainId: user.ceebrainId,
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      gender: user.gender,
      profileImage: user.profileImage,
      address: {
        city: user.address?.city,
        state: user.address?.state,
        country: user.address?.country
      },
      verificationStatus: user.verificationStatus,
      status: user.status,
      authProvider: user.authProvider,
      createdAt: user.createdAt
    }));

    return res.status(200).json({
      status: true,
      message: "Users fetched successfully.",
      users: formattedUsers,
      pagination: {
        totalUsers,
        currentPage: pageNum,
        totalPages,
        pageSize: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({
      status: false,
      message: "Server error while fetching users."
    });
  }
};

module.exports = getAllUsers;

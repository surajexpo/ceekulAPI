const mongoose = require("mongoose");
const { User } = require("../../../models/authModels");

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid userId."
      });
    }

    // Find user and exclude password
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found."
      });
    }

    // Check if user is suspended
    if (user.status === 'Suspended') {
      return res.status(403).json({
        status: false,
        message: "This account has been suspended."
      });
    }

    // Prepare response
    const userResponse = {
      _id: user._id,
      ceebrainId: user.ceebrainId,
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      identityType: user.identityType,
      profileImage: user.profileImage,
      address: user.address,
      belowPovertyLine: user.belowPovertyLine,
      underprivilegedCategory: user.underprivilegedCategory,
      documents: user.documents,
      videoIdentityUrl: user.videoIdentityUrl,
      verificationStatus: user.verificationStatus,
      selfRegulatoryFrameworkAccepted: user.selfRegulatoryFrameworkAccepted,
      consentAcceptedAt: user.consentAcceptedAt,
      authProvider: user.authProvider,
      status: user.status,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return res.status(200).json({
      status: true,
      message: "User fetched successfully.",
      user: userResponse
    });

  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({
      status: false,
      message: "Server error while fetching user."
    });
  }
};

module.exports = getUserById;

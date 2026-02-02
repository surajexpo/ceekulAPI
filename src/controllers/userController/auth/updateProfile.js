const { User } = require('../../../models/authModels');

const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const {
      fullName,
      dateOfBirth,
      gender,
      identityType,
      address,
      belowPovertyLine,
      underprivilegedCategory
    } = req.body;

    const updates = {};

    // Update allowed fields
    if (fullName) {
      updates.fullName = fullName.trim();
    }

    if (dateOfBirth) {
      updates.dateOfBirth = new Date(dateOfBirth);
    }

    if (gender) {
      updates.gender = gender;
    }

    if (identityType) {
      updates.identityType = identityType;
    }

    if (typeof belowPovertyLine === 'boolean') {
      updates.belowPovertyLine = belowPovertyLine;
    }

    if (typeof underprivilegedCategory === 'boolean') {
      updates.underprivilegedCategory = underprivilegedCategory;
    }

    // Handle address updates
    if (address && typeof address === 'object') {
      // Get existing address
      const existingUser = await User.findById(user._id);
      const existingAddress = existingUser.address?.toObject?.() || {};

      updates.address = {
        ...existingAddress,
        ...(address.addressLine1 && { addressLine1: address.addressLine1 }),
        ...(address.addressLine2 !== undefined && { addressLine2: address.addressLine2 }),
        ...(address.landmark !== undefined && { landmark: address.landmark }),
        ...(address.city && { city: address.city }),
        ...(address.district && { district: address.district }),
        ...(address.state && { state: address.state }),
        ...(address.country && { country: address.country }),
        ...(address.postalCode && { postalCode: address.postalCode }),
        ...(address.latitude !== undefined && { latitude: address.latitude }),
        ...(address.longitude !== undefined && { longitude: address.longitude })
      };
    }

    // Handle avatar/profile image upload
    if (req?.files?.avtar && req.files.avtar.length > 0) {
      updates.profileImage = `/public/User/${req.files.avtar[0].filename}`;
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        status: false,
        message: "No valid fields to update"
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    // Prepare response
    const userResponse = {
      _id: updatedUser._id,
      ceebrainId: updatedUser.ceebrainId,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      mobileNumber: updatedUser.mobileNumber,
      dateOfBirth: updatedUser.dateOfBirth,
      gender: updatedUser.gender,
      identityType: updatedUser.identityType,
      profileImage: updatedUser.profileImage,
      address: updatedUser.address,
      belowPovertyLine: updatedUser.belowPovertyLine,
      underprivilegedCategory: updatedUser.underprivilegedCategory,
      verificationStatus: updatedUser.verificationStatus,
      status: updatedUser.status,
      updatedAt: updatedUser.updatedAt
    };

    return res.status(200).json({
      status: true,
      message: "Profile updated successfully",
      user: userResponse
    });

  } catch (error) {
    console.error("UpdateProfile Error:", error.message);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        status: false,
        message: messages.join(', ')
      });
    }

    return res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
};

module.exports = updateProfile;

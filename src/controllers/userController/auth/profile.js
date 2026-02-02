const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { User } = require("../../../models/authModels");

const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid userId."
      });
    }

    // Find existing user
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        status: false,
        message: "User not found."
      });
    }

    // Allowed fields for updates
    const allowedUpdates = [
      "fullName",
      "dateOfBirth",
      "gender",
      "identityType",
      "profileImage",
      // Address fields
      "address.addressLine1",
      "address.addressLine2",
      "address.landmark",
      "address.city",
      "address.district",
      "address.state",
      "address.country",
      "address.postalCode",
      "address.latitude",
      "address.longitude",
      // Socio-economic
      "belowPovertyLine",
      "underprivilegedCategory"
    ];

    const filteredUpdates = {};

    for (const key of allowedUpdates) {
      const keys = key.split(".");
      if (keys.length === 1 && updates[keys[0]] !== undefined) {
        filteredUpdates[keys[0]] = updates[keys[0]];
      } else if (keys.length === 2 && updates[keys[0]]?.[keys[1]] !== undefined) {
        if (!filteredUpdates[keys[0]]) {
          // Preserve existing address fields
          filteredUpdates[keys[0]] = existingUser[keys[0]]?.toObject?.() || {};
        }
        filteredUpdates[keys[0]][keys[1]] = updates[keys[0]][keys[1]];
      }
    }

    // Handle uploaded image (from multer)
    if (req.files && req.files.profileImage && req.files.profileImage.length > 0) {
      const file = req.files.profileImage[0];
      const relativePath = `/public/User/${file.filename}`;

      // Remove old profile image if exists
      if (existingUser?.profileImage) {
        const oldImagePath = path.join(__dirname, `../../../../${existingUser.profileImage}`);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      filteredUpdates.profileImage = relativePath;
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: filteredUpdates },
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
      message: "Profile updated successfully.",
      user: userResponse
    });

  } catch (err) {
    console.error("Error updating profile:", err);

    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        status: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      status: false,
      message: "Server error while updating profile."
    });
  }
};

module.exports = updateUserProfile;

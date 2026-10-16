const mongoose = require("mongoose");
const User = require("../models/User");

// Return safe user information.
const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  profileImage: user.profileImage || "",
});

// GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve profile information.",
    });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, profileImage } = req.body;

    const trimmedName =
      typeof name === "string" ? name.trim() : "";

    const trimmedPhone =
      typeof phone === "string" ? phone.trim() : "";

    const trimmedImage =
      typeof profileImage === "string"
        ? profileImage.trim()
        : "";

    if (!trimmedName) {
      return res.status(400).json({
        success: false,
        message: "Full name is required.",
      });
    }

    if (trimmedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Full name cannot exceed 100 characters.",
      });
    }

    if (!/^\d{10}$/.test(trimmedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must contain exactly 10 digits.",
      });
    }

    if (trimmedImage) {
      let parsedUrl;

      try {
        parsedUrl = new URL(trimmedImage);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid profile image URL.",
        });
      }

      if (
        !["http:", "https:"].includes(parsedUrl.protocol)
      ) {
        return res.status(400).json({
          success: false,
          message: "Profile image URL must use HTTP or HTTPS.",
        });
      }
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    // Check whether another account uses this phone number.
    const existingPhone = await User.findOne({
      phone: trimmedPhone,
      _id: { $ne: user._id },
    });

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "This phone number is already registered.",
      });
    }

    // Only update editable profile fields.
    // Email and password cannot be changed by this endpoint.
    user.name = trimmedName;
    user.phone = trimmedPhone;
    user.profileImage = trimmedImage;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This phone number is already registered.",
      });
    }

    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update your profile.",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
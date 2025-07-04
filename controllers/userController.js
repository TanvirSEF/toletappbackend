const mongoose = require("mongoose");
const User = require('../models/user');
const logger = require("../config/logger");

// Request an upgrade to 'owner' role
exports.requestUpgrade = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Only renters can request an upgrade
    if (user.role !== 'renter') {
      return res.status(403).json({ message: 'Only renters can request an upgrade' });
    }

    if (user.upgradeRequest) {
      return res.status(400).json({ message: 'Upgrade request already sent' });
    }

    user.upgradeRequest = true;
    user.isApproved = false;

    await user.save();

    res.json({ message: 'Upgrade request sent successfully' });
  } catch (err) {
    logger.error('Upgrade request error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get all pending upgrade requests (for admin)
exports.getUpgradeRequests = async (req, res) => {
  try {
    const requests = await User.find({ upgradeRequest: true, isApproved: false });
    res.json(requests);
  } catch (err) {
    logger.error('Get upgrade requests error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Approve a specific user's upgrade request
exports.approveUpgrade = async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.upgradeRequest) {
      return res.status(400).json({ message: 'No upgrade request found for this user' });
    }

    user.role = 'owner';
    user.isApproved = true;
    user.upgradeRequest = false;

    await user.save();

    res.json({
      message: 'User upgraded to owner successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (err) {
    logger.error('Approve upgrade error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Toggle Favorite
exports.toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const propertyId = req.params.propertyId;

    const isFavorited = user.favorites.includes(propertyId);

    if (isFavorited) {
      user.favorites.pull(propertyId);
    } else {
      user.favorites.push(propertyId);
    }

    await user.save();

    res.json({
      message: isFavorited ? "Removed from favorites" : "Added to favorites",
    });
  } catch (err) {
    logger.error("Toggle Favorite Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Favorites
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favorites");
    res.json(user.favorites);
  } catch (err) {
    logger.error("Get Favorites Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.uploadUserProfilePic = async (req, res) => {
  try {
    const user = req.user;
    user.image = req.file.path; // Cloudinary URL
    await user.save();
    res.json({ message: "Profile picture uploaded", image: user.image });
  } catch (err) {
    logger.error("Upload Profile Pic Error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
};
const multer = require("multer");
const {
  profilePicStorage,
  propertyImageStorage,
} = require("../utils/cloudinary");

exports.uploadProfilePic = multer({ storage: profilePicStorage });
exports.uploadPropertyImages = multer({ storage: propertyImageStorage });

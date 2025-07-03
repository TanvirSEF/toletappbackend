const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const profilePicStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "tolet/profile_pics",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const propertyImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "tolet/property_images",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 1024, height: 768, crop: "limit" }],
  },
});

module.exports = {
  cloudinary,
  profilePicStorage,
  propertyImageStorage,
};

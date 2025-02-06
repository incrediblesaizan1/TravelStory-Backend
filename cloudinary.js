import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dwgsunk2t",
  api_key: "862424832733927",
  api_secret: "LI5J2QJBEM_Gew5DYTP-AnSOBZY",
});

const uploadToCloudinary = async (buffer) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });
  };

module.exports = uploadToCloudinary

const cloudinary = require("cloudinary").v2;



cloudinary.config({ 
  cloud_name: 'dzxg0yvyp', 
  api_key: '777918934859475', 
  api_secret: 'Cm0gEQvE_9KwyuUk08IH0lHyujM' 
});


const uploadToCloudinary = async (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Error:', error); // Log error
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

module.exports = uploadToCloudinary
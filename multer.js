const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const cleanName = file.originalname.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    cb(null, uniqueSuffix + '-' + cleanName);
  }
});


const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (file.mimetype.startsWith("image/") && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPG, JPEG, PNG, GIF) are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });  

module.exports = upload;

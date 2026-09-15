'use strict';
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'nexy-foundation/news',
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov']
    };
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

const handleUpload = (multerMiddleware) => {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err) return next(err);
      
      // Attach uploadedMedia for multiple files
      if (req.files && Array.isArray(req.files)) {
        req.uploadedMedia = req.files.map(file => ({
          url: file.path,
          type: file.mimetype.startsWith('video/') ? 'video' : 'image',
          publicId: file.filename
        }));
      }
      next();
    });
  };
};

const uploadMedia = handleUpload(upload.array('media', 5));
const uploadSingle = upload.single('profilePhoto');

module.exports = { uploadMedia, uploadSingle };

'use strict';
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/AppError');

// ─── multer: keep files in memory as buffers ────────────────────────────────
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/mov', 'video/quicktime', 'video/mpeg',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`File type "${file.mimetype}" is not supported`, 400), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter,
});

// ─── Upload a buffer directly to Cloudinary using upload_stream ─────────────
const uploadBufferToCloudinary = (buffer, mimetype, folder = 'nexy-foundation/news') => {
  return new Promise((resolve, reject) => {
    const resourceType = mimetype.startsWith('video/') ? 'video' : 'image';
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary upload error]', error);
          return reject(new AppError('Media upload to cloud storage failed: ' + error.message, 500));
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// ─── Middleware: upload.array('media', 5) + Cloudinary ──────────────────────
const uploadMedia = (req, res, next) => {
  upload.array('media', 5)(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return next(new AppError(`Upload error: ${err.message}`, 400));
    }
    if (err) return next(err);

    // No files attached → plain text news, that is fine
    if (!req.files || req.files.length === 0) {
      req.uploadedMedia = [];
      return next();
    }

    try {
      const results = await Promise.all(
        req.files.map(file =>
          uploadBufferToCloudinary(file.buffer, file.mimetype, 'nexy-foundation/news')
        )
      );

      req.uploadedMedia = results.map((result, i) => ({
        url: result.secure_url,
        type: req.files[i].mimetype.startsWith('video/') ? 'video' : 'image',
        publicId: result.public_id,
      }));

      next();
    } catch (uploadErr) {
      next(uploadErr);
    }
  });
};

// ─── Middleware: upload.single('profilePhoto') + Cloudinary ─────────────────
const uploadSingle = (req, res, next) => {
  upload.single('profilePhoto')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return next(new AppError(`Upload error: ${err.message}`, 400));
    }
    if (err) return next(err);

    if (!req.file) return next(); // no file → just update text fields

    try {
      const result = await uploadBufferToCloudinary(
        req.file.buffer,
        req.file.mimetype,
        'nexy-foundation/profiles'
      );
      // Attach the secure URL so the controller can save it
      req.uploadedPhotoUrl = result.secure_url;
      next();
    } catch (uploadErr) {
      next(uploadErr);
    }
  });
};

module.exports = { uploadMedia, uploadSingle, uploadBufferToCloudinary };

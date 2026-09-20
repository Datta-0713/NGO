'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/AppError');

const TMP_DIR = path.join(os.tmpdir(), 'asian-news-bureau-uploads');
fs.mkdirSync(TMP_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, TMP_DIR),
  filename: (_req, file, cb) => {
    const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`);
  },
});

const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
const videoTypes = ['video/mp4', 'video/quicktime', 'video/mpeg', 'video/webm'];

const makeFilter = ({ allowVideo }) => (req, file, cb) => {
  const allowed = allowVideo ? [...imageTypes, ...videoTypes] : imageTypes;
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new AppError(`File type "${file.mimetype}" is not supported`, 400), false);
};

const mediaUpload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024, files: 5, fields: 20 },
  fileFilter: makeFilter({ allowVideo: true }),
});

const profileUpload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 1, fields: 10 },
  fileFilter: makeFilter({ allowVideo: false }),
});

const uploadFileToCloudinary = (filePath, mimetype, folder) => new Promise((resolve, reject) => {
  const resourceType = mimetype.startsWith('video/') ? 'video' : 'image';
  const stream = cloudinary.uploader.upload_stream(
    {
      folder,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    },
    (error, result) => {
      if (error) return reject(new AppError('Media upload to cloud storage failed', 502));
      resolve(result);
    }
  );
  const readStream = fs.createReadStream(filePath);
  readStream.on('error', reject);
  readStream.pipe(stream);
});

const safeUnlink = async (filePath) => {
  if (!filePath) return;
  try { await fs.promises.unlink(filePath); } catch (_) { /* already removed */ }
};

const runUpload = (middleware, fieldHandler) => (req, res, next) => {
  middleware(req, res, async (err) => {
    if (err instanceof multer.MulterError) return next(new AppError(`Upload error: ${err.message}`, 400));
    if (err) return next(err);

    const files = req.files || (req.file ? [req.file] : []);
    const uploaded = [];
    try {
      for (const file of files) {
        const result = await uploadFileToCloudinary(file.path, file.mimetype, fieldHandler.folder);
        const isVideo = file.mimetype.startsWith('video/');
        const thumbnailUrl = isVideo
          ? cloudinary.url(result.public_id, {
              resource_type: 'video',
              secure: true,
              format: 'jpg',
              transformation: [{ start_offset: '0' }, { width: 900, height: 1125, crop: 'fill', gravity: 'auto', quality: 'auto' }],
            })
          : undefined;
        uploaded.push({
          url: result.secure_url,
          type: isVideo ? 'video' : 'image',
          publicId: result.public_id,
          resourceType: result.resource_type,
          ...(thumbnailUrl ? { thumbnailUrl } : {}),
        });
      }
      await Promise.all(files.map(file => safeUnlink(file.path)));
      await fieldHandler.assign(req, uploaded);
      return next();
    } catch (uploadError) {
      await Promise.all(files.map(file => safeUnlink(file.path)));
      await deleteCloudinaryAssets(uploaded);
      return next(uploadError);
    }
  });
};

const uploadMedia = runUpload(mediaUpload.array('media', 5), {
  folder: 'nexy-foundation/news',
  assign: async (req, uploaded) => { req.uploadedMedia = uploaded; },
});

const uploadSingle = runUpload(profileUpload.single('profilePhoto'), {
  folder: 'nexy-foundation/profiles',
  assign: async (req, uploaded) => {
    if (uploaded[0]) {
      req.uploadedPhoto = uploaded[0];
      req.uploadedPhotoUrl = uploaded[0].url;
    }
  },
});

const destroyCloudinaryAsset = async (asset) => {
  if (!asset?.publicId) return { publicId: '', skipped: true };
  const resourceType = asset.resourceType || (asset.type === 'video' ? 'video' : 'image');
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const result = await cloudinary.uploader.destroy(asset.publicId, {
        resource_type: resourceType,
        invalidate: true,
      });
      if (result?.result === 'ok' || result?.result === 'not found') {
        return { publicId: asset.publicId, resourceType, result: result.result };
      }
      lastError = new Error(`Cloudinary returned ${result?.result || 'unknown result'}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 250));
  }
  return { publicId: asset.publicId, resourceType, error: lastError };
};

const deleteCloudinaryAssets = async (assets = [], { strict = false } = {}) => {
  const results = await Promise.all(assets.filter(a => a?.publicId).map(destroyCloudinaryAsset));
  const failures = results.filter((result) => result?.error);
  if (failures.length && strict) {
    const error = new AppError(`Cloud storage cleanup failed for ${failures.length} asset(s). Database content was not removed.`, 502);
    error.cleanupFailures = failures.map((item) => ({ publicId: item.publicId, resourceType: item.resourceType, message: item.error?.message || 'Unknown Cloudinary error' }));
    throw error;
  }
  failures.forEach((failure) => console.warn('[Cloudinary cleanup failed]', failure.publicId, failure.error?.message));
  return { results, failures };
};

const deleteCloudinaryAssetsStrict = (assets = []) => deleteCloudinaryAssets(assets, { strict: true });

module.exports = { uploadMedia, uploadSingle, uploadFileToCloudinary, deleteCloudinaryAssets, deleteCloudinaryAssetsStrict, safeUnlink };

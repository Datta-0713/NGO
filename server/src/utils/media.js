'use strict';
const cloudinary = require('../config/cloudinary');

const buildVideoThumbnailUrl = (publicId) => {
  if (!publicId) return '';
  return cloudinary.url(publicId, {
    resource_type: 'video',
    secure: true,
    format: 'jpg',
    transformation: [
      { start_offset: '0' },
      { width: 900, height: 1125, crop: 'fill', gravity: 'auto', quality: 'auto' },
    ],
  });
};

const normalizeMedia = (media = []) => media.map((item) => {
  const value = typeof item.toObject === 'function' ? item.toObject() : { ...item };
  if (value.type === 'video' && !value.thumbnailUrl && value.publicId) {
    value.thumbnailUrl = buildVideoThumbnailUrl(value.publicId);
  }
  return value;
});

module.exports = { buildVideoThumbnailUrl, normalizeMedia };

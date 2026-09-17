'use strict';
const AdminAuditLog = require('../models/AdminAuditLog');

const writeAuditLog = async ({ admin, action, entityType, entityId, before = null, after = null, reason = '', req, session = null }) => {
  const payload = {
    admin,
    action,
    entityType,
    entityId: entityId || null,
    before,
    after,
    reason,
    ip: req?.ip || '',
    userAgent: req?.get?.('user-agent') || '',
  };
  const docs = await AdminAuditLog.create([payload], session ? { session } : undefined);
  return docs[0];
};

module.exports = { writeAuditLog };

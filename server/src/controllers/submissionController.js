'use strict';
const mongoose = require('mongoose');
const News = require('../models/News');
const User = require('../models/User');
const SubmissionRevision = require('../models/SubmissionRevision');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const creditService = require('../services/creditService');
const notificationService = require('../services/notificationService');
const { writeAuditLog } = require('../utils/audit');
const { withTransaction } = require('../utils/dbTransaction');
const { deleteCloudinaryAssets } = require('../middlewares/upload');
const { getCreditPerApproval } = require('../services/settingsService');
const { escapeRegex } = require('../utils/security');

const pagination = (page, limit, defaultLimit = 20) => ({
  page: Math.max(1, Number(page) || 1),
  limit: Math.min(100, Math.max(1, Number(limit) || defaultLimit)),
});

const snapshot = (news) => ({
  title: news.title,
  description: news.description,
  location: news.location,
  date: news.date,
  category: news.category,
  media: news.media || [],
});

const saveRevision = async (news, authorId, changeNote = '', session = null) => {
  const current = await SubmissionRevision.findOne({ submission: news._id }).sort({ revisionNumber: -1 }).session(session);
  const revisionNumber = (current?.revisionNumber || 0) + 1;
  await SubmissionRevision.create([{
    submission: news._id,
    author: authorId,
    revisionNumber,
    ...snapshot(news),
    changeNote,
  }], session ? { session } : undefined);
};

const submitNews = asyncHandler(async (req, res) => {
  const uploaded = req.uploadedMedia || [];
  try {
    const news = await withTransaction(async (session) => {
      const created = (await News.create([{
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        date: req.body.date,
        category: req.body.category,
        sourceUrl: req.body.sourceUrl || '',
        geo: req.body.geo || undefined,
        media: uploaded,
        status: 'pending',
        submittedBy: req.user._id,
      }], { session }))[0];
      await saveRevision(created, req.user._id, 'Initial submission', session);
      return created;
    });
    sendSuccess(res, 201, { news: news.toJSON() }, 'News submitted successfully for review');
  } catch (error) {
    await deleteCloudinaryAssets(uploaded);
    throw error;
  }
});

const getMySubmissions = asyncHandler(async (req, res) => {
  const { page, limit } = pagination(req.query.page, req.query.limit, 10);
  const filter = { submittedBy: req.user._id };
  if (req.query.status && ['pending', 'under_review', 'needs_changes', 'published', 'rejected'].includes(req.query.status)) {
    filter.status = req.query.status;
  }
  const [submissions, total] = await Promise.all([
    News.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    News.countDocuments(filter),
  ]);
  sendSuccess(res, 200, { submissions, total, page, limit, totalPages: Math.ceil(total / limit) });
});

const getMySubmissionById = asyncHandler(async (req, res) => {
  const news = await News.findOne({ _id: req.params.id, submittedBy: req.user._id });
  if (!news) throw new AppError('Submission not found', 404);
  sendSuccess(res, 200, { news });
});

const getMySubmissionHistory = asyncHandler(async (req, res) => {
  const owns = await News.exists({ _id: req.params.id, submittedBy: req.user._id });
  if (!owns) throw new AppError('Submission not found', 404);
  const revisions = await SubmissionRevision.find({ submission: req.params.id }).sort({ revisionNumber: -1 });
  sendSuccess(res, 200, { revisions });
});

const getAdminSubmissionsQueue = asyncHandler(async (req, res) => {
  const { page, limit } = pagination(req.query.page, req.query.limit, 20);
  const filter = { createdByAdmin: false, deletedAt: null };
  if (req.query.status && ['pending', 'under_review', 'needs_changes', 'published', 'rejected'].includes(req.query.status)) filter.status = req.query.status;
  if (req.query.search?.trim()) {
    const regex = new RegExp(escapeRegex(req.query.search.trim().slice(0, 100)), 'i');
    const authors = await User.find({ name: regex }).select('_id').limit(100);
    filter.$or = [
      { title: regex }, { description: regex }, { location: regex },
      ...(authors.length ? [{ submittedBy: { $in: authors.map(a => a._id) } }] : []),
    ];
  }
  const [submissions, total] = await Promise.all([
    News.find(filter)
      .populate('submittedBy', 'name email profilePhoto credits storiesCount likesReceived')
      .populate('claimedBy', 'name email')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    News.countDocuments(filter),
  ]);
  sendSuccess(res, 200, { submissions, total, page, limit, totalPages: Math.ceil(total / limit) });
});

const claimSubmission = asyncHandler(async (req, res) => {
  const news = await withTransaction(async (session) => {
    const updated = await News.findOneAndUpdate(
      { _id: req.params.id, status: 'pending', $or: [{ claimedBy: null }, { claimedBy: req.user._id }] },
      { $set: { status: 'under_review', claimedBy: req.user._id, claimedAt: new Date() } },
      { new: true, session }
    );
    if (!updated) throw new AppError('Submission is unavailable or has already been claimed.', 409);
    await writeAuditLog({
      admin: req.user._id, action: 'submission_claimed', entityType: 'News', entityId: updated._id,
      after: { status: updated.status, claimedBy: updated.claimedBy }, req, session,
    });
    return updated.populate('submittedBy', 'name email profilePhoto credits storiesCount likesReceived');
  });
  sendSuccess(res, 200, { news }, 'Submission claimed for review');
});

// State machine: pending -> approve->published | requestChanges->needs_changes | reject->rejected | claim->under_review
// under_review -> approve->published | requestChanges->needs_changes | reject->rejected
// needs_changes -> ONLY resubmit (back to pending). No approve/requestChanges/reject allowed from needs_changes.
// published/rejected are finalized.
const assertReviewAccess = async (id, adminId) => {
  const current = await News.findById(id).select('status claimedBy submittedBy title rejectionMessage media');
  if (!current || current.createdByAdmin) throw new AppError('Submission not found', 404);
  // finalized or in needs_changes state - only resubmission is allowed from needs_changes
  if (['published', 'rejected', 'needs_changes'].includes(current.status)) throw new AppError('Submission has already been finalized or needs resubmission.', 409);
  if (current.status === 'under_review' && current.claimedBy && String(current.claimedBy) !== String(adminId)) {
    throw new AppError('This submission is currently being reviewed by another admin.', 409);
  }
  return current;
};

const approveSubmission = asyncHandler(async (req, res) => {
  const current = await assertReviewAccess(req.params.id, req.user._id);
  const result = await withTransaction(async (session) => {
    const news = await News.findOneAndUpdate(
      { _id: req.params.id, createdByAdmin: false, status: { $in: ['pending', 'under_review'] }, $or: [{ claimedBy: null }, { claimedBy: req.user._id }] },
      { $set: { status: 'published', publishedAt: new Date(), reviewedBy: req.user._id, reviewedAt: new Date(), claimedBy: null, claimedAt: null } },
      { new: true, session }
    );
    if (!news) throw new AppError('Submission was already reviewed or is locked by another admin.', 409);

    if (news.submittedBy) {
      const creditReward = await getCreditPerApproval(session);
      await creditService.awardCredits(news.submittedBy, creditReward, 'Story published', news._id, {
        session,
        dedupeKey: `submission:${news._id}:approval-credit:${creditReward}`,
      });
      await User.findByIdAndUpdate(news.submittedBy, { $inc: { storiesCount: 1 } }, { session });
      const notification = await notificationService.createNotification(news.submittedBy, {
        type: 'news_approved',
        title: '🎉 Your Story is Live!',
        message: `Your story "${news.title}" has been published to the community. You've earned ${creditReward} credits!`,
        relatedEntity: { entityId: news._id, entityType: 'News' },
        dedupeKey: `submission:${news._id}:approval-notification`,
      }, { session });
      await writeAuditLog({
        admin: req.user._id, action: 'submission_approved', entityType: 'News', entityId: news._id,
        before: { status: current.status }, after: { status: 'published', creditReward }, req, session,
      });
      return { news, notification };
    }
    await writeAuditLog({
      admin: req.user._id, action: 'news_published', entityType: 'News', entityId: news._id,
      before: { status: current.status }, after: { status: 'published' }, req, session,
    });
    return { news, notification: null };
  });

  if (result.notification) {
    try { await notificationService.sendPushForNotification(result.notification); }
    catch (error) { console.warn('[Push] Approval push failed:', error.message); }
  }
  sendSuccess(res, 200, { news: result.news.toJSON() }, 'Submission approved and published');
});

const requestChanges = asyncHandler(async (req, res) => {
  const current = await assertReviewAccess(req.params.id, req.user._id);
  const message = String(req.body.rejectionMessage || '').trim() || 'Please revise the story and resubmit it with the requested changes.';
  const result = await withTransaction(async (session) => {
    const news = await News.findOneAndUpdate(
      { _id: current._id, status: { $in: ['pending', 'under_review'] }, $or: [{ claimedBy: null }, { claimedBy: req.user._id }] },
      { $set: { status: 'needs_changes', rejectionMessage: message, reviewedBy: req.user._id, reviewedAt: new Date(), claimedBy: null, claimedAt: null } },
      { new: true, session }
    );
    if (!news) throw new AppError('Submission was already reviewed or is locked by another admin.', 409);
    const notification = news.submittedBy ? await notificationService.createNotification(news.submittedBy, {
      type: 'news_needs_changes',
      title: '📝 Your Story Needs Changes',
      message: `Your story "${news.title}" needs revision. ${message}`,
      relatedEntity: { entityId: news._id, entityType: 'Submission' },
      dedupeKey: `submission:${news._id}:changes:${news.updatedAt.getTime()}`,
    }, { session }) : null;
    await writeAuditLog({
      admin: req.user._id, action: 'submission_changes_requested', entityType: 'News', entityId: news._id,
      before: { status: current.status }, after: { status: news.status, rejectionMessage: message }, reason: message, req, session,
    });
    return { news, notification };
  });
  if (result.notification) {
    try { await notificationService.sendPushForNotification(result.notification); }
    catch (error) { console.warn('[Push] Changes-request push failed:', error.message); }
  }
  sendSuccess(res, 200, { news: result.news }, 'Changes requested from contributor');
});

const rejectSubmission = asyncHandler(async (req, res) => {
  const current = await assertReviewAccess(req.params.id, req.user._id);
  const message = String(req.body.rejectionMessage || '').trim() || 'This submission was not approved under our community guidelines.';
  const result = await withTransaction(async (session) => {
    const news = await News.findOneAndUpdate(
      { _id: current._id, status: { $in: ['pending', 'under_review'] }, $or: [{ claimedBy: null }, { claimedBy: req.user._id }] },
      { $set: { status: 'rejected', rejectionMessage: message, reviewedBy: req.user._id, reviewedAt: new Date(), claimedBy: null, claimedAt: null } },
      { new: true, session }
    );
    if (!news) throw new AppError('Submission was already finalized or is locked by another admin.', 409);
    const notification = news.submittedBy ? await notificationService.createNotification(news.submittedBy, {
      type: 'news_rejected',
      title: 'Your Story Was Not Published',
      message: `Your story "${news.title}" was not approved. ${message}`,
      relatedEntity: { entityId: news._id, entityType: 'Submission' },
      dedupeKey: `submission:${news._id}:rejected:${news.updatedAt.getTime()}`,
    }, { session }) : null;
    await writeAuditLog({
      admin: req.user._id, action: 'submission_rejected', entityType: 'News', entityId: news._id,
      before: { status: current.status }, after: { status: news.status }, reason: message, req, session,
    });
    return { news, notification };
  });
  if (result.notification) {
    try { await notificationService.sendPushForNotification(result.notification); }
    catch (error) { console.warn('[Push] Rejection push failed:', error.message); }
  }
  sendSuccess(res, 200, { news: result.news }, 'Submission rejected');
});

const resubmitNews = asyncHandler(async (req, res) => {
  const uploaded = req.uploadedMedia || [];
  const oldMedia = [];
  try {
    const news = await withTransaction(async (session) => {
      const current = await News.findOne({ _id: req.params.id, submittedBy: req.user._id, status: { $in: ['needs_changes', 'rejected'] }, deletedAt: null }).session(session);
      if (!current) throw new AppError('Only a rejected or revision-requested submission can be resubmitted.', 409);
      // Media handling: if new media uploaded, collect old media for deletion and replace.
      // If no new media, old media is preserved (oldMedia stays empty, no deletion occurs).
      if (uploaded.length) oldMedia.push(...(current.media || []));
      current.title = req.body.title;
      current.description = req.body.description;
      current.location = req.body.location;
      current.date = req.body.date;
      current.category = req.body.category;
      current.sourceUrl = req.body.sourceUrl || current.sourceUrl || '';
      current.geo = req.body.geo || current.geo;
      if (uploaded.length) current.media = uploaded;
      current.status = 'pending';
      current.rejectionMessage = '';
      current.reviewedBy = null;
      current.reviewedAt = null;
      current.claimedBy = null;
      current.claimedAt = null;
      await current.save({ session });
      await saveRevision(current, req.user._id, 'Contributor resubmission', session);
      return current;
    });
    if (oldMedia.length) await deleteCloudinaryAssets(oldMedia);
    sendSuccess(res, 200, { news: news.toJSON() }, 'Submission resubmitted for review');
  } catch (error) {
    await deleteCloudinaryAssets(uploaded);
    throw error;
  }
});

const getSubmissionHistory = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new AppError('Invalid submission id', 400);
  const revisions = await SubmissionRevision.find({ submission: req.params.id })
    .sort({ revisionNumber: -1 })
    .populate('author', 'name email profilePhoto');
  sendSuccess(res, 200, { revisions });
});

const getSubmissionById = asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id)
    .select('+adminNotes +evidenceNotes')
    .populate('submittedBy', 'name email profilePhoto credits storiesCount likesReceived')
    .populate('claimedBy', 'name email')
    .populate('reviewedBy', 'name email');
  if (!news) throw new AppError('Submission not found', 404);
  const revisions = await SubmissionRevision.find({ submission: news._id }).sort({ revisionNumber: -1 }).limit(20).populate('author', 'name email');
  sendSuccess(res, 200, { news, revisions });
});

/**
 * PATCH /api/admin/submissions/:id/notes
 * Updates internal admin/evidence notes on a submission.
 * Only admins can update notes; the notes are NOT visible to the contributor.
 */
const updateSubmissionNotes = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new AppError('Invalid submission id', 400);
  const adminNotes = req.body.adminNotes != null ? String(req.body.adminNotes).slice(0, 5000) : undefined;
  const evidenceNotes = req.body.evidenceNotes != null ? String(req.body.evidenceNotes).slice(0, 5000) : undefined;
  if (adminNotes === undefined && evidenceNotes === undefined) {
    throw new AppError('At least one of adminNotes or evidenceNotes is required.', 400);
  }
  const news = await News.findById(req.params.id).select('+adminNotes +evidenceNotes');
  if (!news) throw new AppError('Submission not found', 404);
  const before = { adminNotes: news.adminNotes || '', evidenceNotes: news.evidenceNotes || '' };
  if (adminNotes !== undefined) news.adminNotes = adminNotes;
  if (evidenceNotes !== undefined) news.evidenceNotes = evidenceNotes;
  await news.save();
  await writeAuditLog({
    admin: req.user._id, action: 'submission_notes_updated', entityType: 'News', entityId: news._id,
    before, after: { adminNotes: news.adminNotes, evidenceNotes: news.evidenceNotes }, req,
  });
  sendSuccess(res, 200, { news: news.toJSON() }, 'Notes updated');
});

module.exports = {
  submitNews, getMySubmissions, getMySubmissionById, getMySubmissionHistory,
  getAdminSubmissionsQueue, claimSubmission, approveSubmission, requestChanges,
  rejectSubmission, resubmitNews, getSubmissionHistory, getSubmissionById,
  updateSubmissionNotes,
};

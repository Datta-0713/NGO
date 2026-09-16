import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';
import { approveSubmission, rejectSubmission } from '@/store/slices/submissionsSlice';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { MapPin, Calendar, Tag, CheckCircle, XCircle, Trash2, MessageCircle } from 'lucide-react';
import { getComments, deleteComment } from '@/api/newsApi';
import { safeFormat } from '@/utils/date';
import type { NewsItem } from '@/types';

interface Props {
  submission: NewsItem;
  onClose: () => void;
}

export const SubmissionDetailModal: React.FC<Props> = ({ submission, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [rejecting, setRejecting] = useState(false);
  const [rejectionMsg, setRejectionMsg] = useState('');
  const [approving, setApproving] = useState(false);
  const [rejectingLoading, setRejectingLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  useEffect(() => {
    if (submission.status === 'published') {
      setCommentsLoading(true);
      getComments(submission._id)
        .then(setComments)
        .catch(console.error)
        .finally(() => setCommentsLoading(false));
    }
  }, [submission._id, submission.status]);

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteComment(submission._id, commentId);
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete comment');
    }
  };

  const author = submission.submittedBy as any;

  const handleApprove = async () => {
    setApproving(true);
    setError('');
    try {
      await dispatch(approveSubmission(submission._id)).unwrap();
      onClose();
    } catch (err: any) {
      setError(typeof err === 'string' ? err : err?.message || 'Failed to approve submission');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    setRejectingLoading(true);
    setError('');
    try {
      await dispatch(rejectSubmission({ id: submission._id, msg: rejectionMsg })).unwrap();
      onClose();
    } catch (err: any) {
      setError(typeof err === 'string' ? err : err?.message || 'Failed to reject submission');
    } finally {
      setRejectingLoading(false);
    }
  };

  const isPending = submission.status === 'pending';

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Submission Review"
      size="lg"
      footer={
        isPending ? (
          <>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            {!rejecting && (
              <Button variant="danger" icon={<XCircle size={16} />} onClick={() => setRejecting(true)}>
                Reject
              </Button>
            )}
            {!rejecting && (
              <Button icon={<CheckCircle size={16} />} loading={approving} onClick={handleApprove}>
                Approve & Publish
              </Button>
            )}
            {rejecting && (
              <Button variant="secondary" onClick={() => setRejecting(false)}>Back</Button>
            )}
            {rejecting && (
              <Button variant="danger" loading={rejectingLoading} onClick={handleReject}>
                Confirm Rejection
              </Button>
            )}
          </>
        ) : (
          <Button variant="secondary" onClick={onClose}>Close</Button>
        )
      }
    >
      {/* Error banner */}
      {error && (
        <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Rejection reason input */}
      {rejecting && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm font-semibold text-red-700 mb-2">Rejection reason (optional but recommended)</p>
          <textarea
            rows={3}
            placeholder="Tell the contributor what needs to be improved..."
            value={rejectionMsg}
            onChange={e => setRejectionMsg(e.target.value)}
            className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none bg-white"
          />
        </div>
      )}

      {/* Media */}
      {submission.media && submission.media.length > 0 && (
        <div className="mb-5 rounded-xl overflow-hidden bg-gray-100 max-h-64">
          {submission.media[0].type === 'video' ? (
            <video src={submission.media[0].url} controls className="w-full h-64 object-cover" />
          ) : (
            <img src={submission.media[0].url} alt={submission.title} className="w-full h-64 object-cover" />
          )}
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <Badge status={submission.status} />
        <div className="flex items-center gap-1.5 text-sm text-muted">
          <Tag size={14} /><span>{submission.category}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted">
          <MapPin size={14} /><span>{submission.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted">
          <Calendar size={14} />
          <span>{safeFormat(submission.date || submission.createdAt, 'MMM d, yyyy')}</span>
        </div>
      </div>

      {/* Title + Body */}
      <h3 className="text-lg font-bold text-gray-900 mb-3">{submission.title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed mb-6">{submission.description}</p>

      {/* Contributor */}
      {author && (
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-6">
          <Avatar src={author.profilePhoto} name={author.name} size={40} />
          <div>
            <p className="text-sm font-semibold text-gray-900">{author.name}</p>
            <p className="text-xs text-muted">{author.email}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-muted">Credits</p>
            <p className="text-sm font-bold text-primary">{author.credits ?? 0}</p>
          </div>
        </div>
      )}

      {/* Comments Section (Only for published items) */}
      {submission.status === 'published' && (
        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle size={18} className="text-gray-500" />
            <h4 className="font-bold text-gray-900">Comments</h4>
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-semibold">{comments.length}</span>
          </div>

          {commentsLoading ? (
            <p className="text-sm text-gray-500 py-4 text-center">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center bg-gray-50 rounded-xl">No comments yet</p>
          ) : (
            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
              {comments.map((c: any) => (
                <div key={c._id} className="flex gap-3 p-3 bg-gray-50 rounded-xl group relative">
                  <Avatar src={c.user?.profilePhoto} name={c.user?.name || 'User'} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900">{c.user?.name || 'Unknown User'}</span>
                      <span className="text-xs text-gray-500">{safeFormat(c.createdAt, 'MMM d, HH:mm')}</span>
                    </div>
                    <p className="text-sm text-gray-700">{c.text}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteComment(c._id)}
                    className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-lg opacity-0 group-hover:opacity-100 shadow-sm transition-opacity hover:bg-red-50"
                    title="Delete Comment"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
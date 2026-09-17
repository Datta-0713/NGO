import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';
import { approveSubmission, claimSubmission, rejectSubmission, requestChanges } from '@/store/slices/submissionsSlice';
import * as api from '@/api/submissionsApi';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { MapPin, Calendar, Tag, CheckCircle, XCircle, Trash2, MessageCircle, ClipboardCheck, History } from 'lucide-react';
import { getComments, deleteComment } from '@/api/newsApi';
import { safeFormat } from '@/utils/date';
import type { NewsItem } from '@/types';

interface Props { submission: NewsItem; onClose: () => void; }
const statusLabel: Record<string,string> = { pending:'Pending', under_review:'Under Review', needs_changes:'Needs Changes', published:'Published', rejected:'Rejected', archived:'Archived' };

export const SubmissionDetailModal: React.FC<Props> = ({ submission, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [action, setAction] = useState<'reject'|'changes'|null>(null);
  const [message, setMessage] = useState('');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (submission.status === 'published') {
      setCommentsLoading(true);
      getComments(submission._id).then(data => { if (!cancelled) setComments(data); }).catch(() => null).finally(() => { if (!cancelled) setCommentsLoading(false); });
    }
    return () => { cancelled = true; };
  }, [submission._id, submission.status]);

  const loadHistory = async () => {
    try { const res = await api.getSubmissionHistory(submission._id); setHistory(res.data?.revisions || []); setHistoryOpen(true); }
    catch (e: any) { setError(e?.response?.data?.message || 'Failed to load revision history'); }
  };

  const run = async (kind: 'claim'|'approve'|'reject'|'changes') => {
    setWorking(true); setError('');
    try {
      if (kind === 'claim') await dispatch(claimSubmission(submission._id)).unwrap();
      if (kind === 'approve') await dispatch(approveSubmission(submission._id)).unwrap();
      if (kind === 'reject') await dispatch(rejectSubmission({ id: submission._id, msg: message })).unwrap();
      if (kind === 'changes') await dispatch(requestChanges({ id: submission._id, msg: message })).unwrap();
      if (kind !== 'claim') onClose();
      else setAction(null);
    } catch (e: any) { setError(typeof e === 'string' ? e : e?.message || 'Action failed'); }
    finally { setWorking(false); }
  };

  const actionable = ['pending','under_review'].includes(submission.status);
  const isMine = submission.status === 'under_review' && submission.claimedBy;
  const author = submission.submittedBy as any;

  return <Modal isOpen={true} onClose={onClose} title="Submission Review" size="lg" footer={<>
    <Button variant="secondary" onClick={onClose}>Close</Button>
    <Button variant="secondary" icon={<History size={16}/>} onClick={loadHistory}>History</Button>
    {submission.status === 'pending' && <Button variant="secondary" icon={<ClipboardCheck size={16}/>} loading={working} onClick={()=>run('claim')}>Claim</Button>}
    {actionable && (submission.status !== 'under_review' || isMine) && !action && <>
      <Button variant="danger" icon={<XCircle size={16}/>} onClick={()=>{setAction('reject');setMessage('')}}>Reject</Button>
      <Button variant="secondary" onClick={()=>{setAction('changes');setMessage('')}}>Request Changes</Button>
      <Button icon={<CheckCircle size={16}/>} loading={working} onClick={()=>run('approve')}>Approve & Publish</Button>
    </>}
    {action && <>
      <Button variant="secondary" onClick={()=>setAction(null)}>Back</Button>
      <Button variant="danger" loading={working} onClick={()=>run(action === 'reject' ? 'reject' : 'changes')}>{action === 'reject' ? 'Confirm Rejection' : 'Send Change Request'}</Button>
    </>}
  </>}>
    {error && <div className="mb-5 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">{error}</div>}
    {action && <div className={`mb-5 p-4 rounded-xl border ${action==='reject'?'bg-red-50 border-red-200':'bg-amber-50 border-amber-200'}`}><p className="text-sm font-semibold mb-2">{action==='reject'?'Reason for rejection':'Changes requested from contributor'}</p><textarea rows={4} maxLength={1000} placeholder="Give the contributor a clear, actionable explanation..." value={message} onChange={e=>setMessage(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none bg-white focus:outline-none focus:ring-2 focus:ring-primary"/><p className="text-xs text-muted text-right mt-1">{message.length}/1000</p></div>}
    {submission.media?.length>0 && <div className="mb-5 rounded-xl overflow-hidden bg-gray-100 max-h-64">{submission.media[0].type==='video'?<video src={submission.media[0].url} controls className="w-full h-64 object-cover"/>:<img src={submission.media[0].url} alt={submission.title} className="w-full h-64 object-cover"/>}</div>}
    <div className="flex items-center gap-3 flex-wrap mb-4"><Badge status={submission.status}/><span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{statusLabel[submission.status]}</span><div className="flex items-center gap-1.5 text-sm text-muted"><Tag size={14}/>{submission.category}</div><div className="flex items-center gap-1.5 text-sm text-muted"><MapPin size={14}/>{submission.location}</div><div className="flex items-center gap-1.5 text-sm text-muted"><Calendar size={14}/>{safeFormat(submission.date||submission.createdAt,'MMM d, yyyy')}</div></div>
    <h3 className="text-lg font-bold text-gray-900 mb-3">{submission.title}</h3><p className="text-sm text-gray-600 leading-relaxed mb-6">{submission.description}</p>
    {submission.rejectionMessage && <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 mb-6"><p className="text-xs font-semibold text-amber-700 uppercase">Moderator feedback</p><p className="text-sm text-gray-700 mt-1">{submission.rejectionMessage}</p></div>}
    {author && <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-6"><Avatar src={author.profilePhoto} name={author.name} size={40}/><div><p className="text-sm font-semibold text-gray-900">{author.name}</p><p className="text-xs text-muted">{author.email}</p></div><div className="ml-auto text-right"><p className="text-xs text-muted">Credits</p><p className="text-sm font-bold text-primary">{author.credits??0}</p></div></div>}
    {historyOpen && <div className="border rounded-xl overflow-hidden mb-6"><div className="px-4 py-3 bg-gray-50 border-b font-semibold text-sm">Revision History</div>{history.length===0?<p className="p-4 text-sm text-muted">No revisions recorded.</p>:history.map((h:any)=><div key={`${h._id}-${h.revisionNumber}`} className="p-4 border-b last:border-b-0"><div className="flex justify-between gap-4"><span className="font-semibold text-sm">Revision {h.revisionNumber}</span><span className="text-xs text-muted">{safeFormat(h.createdAt,'MMM d, yyyy HH:mm')}</span></div><p className="text-sm text-gray-700 mt-1">{h.changeNote||'—'}</p><p className="text-xs text-muted mt-1">By {h.author?.name||'Unknown'}</p></div>)}</div>}
    {submission.status==='published' && <div className="border-t border-gray-100 pt-6"><div className="flex items-center gap-2 mb-4"><MessageCircle size={18} className="text-gray-500"/><h4 className="font-bold text-gray-900">Comments</h4><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-semibold">{comments.length}</span></div>{commentsLoading?<p className="text-sm text-gray-500 py-4 text-center">Loading comments...</p>:comments.length===0?<p className="text-sm text-gray-500 py-4 text-center bg-gray-50 rounded-xl">No comments yet</p>:<div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">{comments.map(c=><div key={c._id} className="flex gap-3 p-3 bg-gray-50 rounded-xl group relative"><Avatar src={c.user?.profilePhoto} name={c.user?.name||'User'} size={32}/><div className="flex-1 min-w-0"><div className="flex items-center justify-between mb-1"><span className="text-sm font-semibold text-gray-900">{c.user?.name||'Unknown User'}</span><span className="text-xs text-gray-500">{safeFormat(c.createdAt,'MMM d, HH:mm')}</span></div><p className="text-sm text-gray-700">{c.text}</p></div><button onClick={async()=>{if(window.confirm('Delete this comment?')){await deleteComment(submission._id,c._id);setComments(prev=>prev.filter(x=>x._id!==c._id));}}} className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-lg opacity-0 group-hover:opacity-100 shadow-sm transition-opacity" title="Delete Comment"><Trash2 size={14}/></button></div>)}</div>}</div>}
  </Modal>;
};

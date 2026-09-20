import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { safeFormat } from '@/utils/date';
import {
  Archive, CheckCircle2, Eye, Image as ImageIcon, MessageCircle,
  RotateCcw, Save, Trash2, UploadCloud, Video, X,
} from 'lucide-react';
import * as newsApi from '@/api/newsApi';
import type { NewsComment, NewsItem, SubmissionRevision } from '@/types';

interface Props {
  newsId: string;
  onClose: () => void;
  onChanged: () => void;
}

type DetailPayload = {
  news: NewsItem;
  comments: NewsComment[];
  revisions: SubmissionRevision[];
  engagement: { likes: number; comments: number; saves: number; views: number };
  notificationsCount: number;
};

const toDateInput = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

export const NewsDetailModal: React.FC<Props> = ({ newsId, onClose, onChanged }) => {
  const [detail, setDetail] = useState<DetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ title: '', description: '', location: '', date: '', category: 'Community', sourceUrl: '' });
  const [adminNotes, setAdminNotes] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');

  const news = detail?.news;
  const isArchived = news?.status === 'archived' || Boolean((news as any)?.deletedAt);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await newsApi.getAdminNewsById(newsId);
      const next = response.data as DetailPayload;
      setDetail(next);
      setForm({
        title: next.news.title,
        description: next.news.description,
        location: next.news.location,
        date: toDateInput(next.news.date),
        category: next.news.category,
        sourceUrl: next.news.sourceUrl || '',
      });
      setAdminNotes(next.news.adminNotes || '');
      setEvidenceNotes(next.news.evidenceNotes || '');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load news details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [newsId]);

  const mediaCount = news?.media?.length ?? 0;
  const totalEngagement = useMemo(() => {
    if (!detail) return 0;
    return detail.engagement.likes + detail.engagement.comments + detail.engagement.saves;
  }, [detail]);

  const showResult = (message: string) => {
    setSuccess(message);
    window.setTimeout(() => setSuccess(''), 2500);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!news) return;
    setSaving(true); setError('');
    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('description', form.description);
      data.append('location', form.location);
      data.append('date', form.date);
      data.append('category', form.category);
      data.append('sourceUrl', form.sourceUrl);
      files.forEach(file => data.append('media', file));
      const response = await newsApi.updateAdminNews(news._id, data);
      setFiles([]);
      const updated = response.data.news as NewsItem;
      setDetail(previous => previous ? { ...previous, news: { ...previous.news, ...updated } } : previous);
      showResult(files.length ? `Saved changes and added ${files.length} media file${files.length === 1 ? '' : 's'}.` : 'News changes saved.');
      await load();
      onChanged();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save changes.');
    } finally { setSaving(false); }
  };

  const handleArchiveRestore = async () => {
    if (!news) return;
    setWorking(true); setError('');
    try {
      if (isArchived) {
        await newsApi.restoreAdminNews(news._id);
        showResult('News restored to the active content list.');
      } else {
        await newsApi.archiveAdminNews(news._id);
        showResult('News archived and removed from the active list.');
      }
      await load(); onChanged();
    } catch (err: any) {
      setError(err?.response?.data?.message || `Failed to ${isArchived ? 'restore' : 'archive'} news.`);
    } finally { setWorking(false); }
  };

  const handlePermanentDelete = async () => {
    if (!news) return;
    const confirmed = window.confirm(`Permanently delete “${news.title}”? This removes the story, comments, likes, saves, reports, revisions, notifications and all Cloudinary media. This cannot be undone.`);
    if (!confirmed) return;
    setWorking(true); setError('');
    try {
      await newsApi.permanentlyDeleteAdminNews(news._id);
      onChanged();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Permanent deletion failed. No database deletion should occur if cloud cleanup failed.');
    } finally { setWorking(false); }
  };

  const handleDeleteMedia = async (index: number) => {
    if (!news) return;
    const media = news.media[index];
    const confirmed = window.confirm(`Permanently delete media ${index + 1}${media.type === 'video' ? ' (video)' : ''}? The Cloudinary asset will also be removed.`);
    if (!confirmed) return;
    setWorking(true); setError('');
    try {
      const response = await newsApi.deleteAdminNewsMedia(news._id, index);
      setDetail(previous => previous ? { ...previous, news: { ...previous.news, media: response.data.news.media } } : previous);
      showResult('Media deleted permanently.');
      onChanged();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Media deletion failed.');
    } finally { setWorking(false); }
  };

  const handleSaveNotes = async () => {
    if (!news) return;
    setWorking(true); setError('');
    try {
      await newsApi.updateAdminNewsNotes(news._id, { adminNotes, evidenceNotes });
      showResult('Internal notes saved.');
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save internal notes.');
    } finally { setWorking(false); }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!news || !window.confirm('Permanently delete this comment?')) return;
    setWorking(true); setError('');
    try {
      await newsApi.deleteAdminComment(news._id, commentId);
      setDetail(previous => previous ? { ...previous, comments: previous.comments.filter(comment => comment._id !== commentId) } : previous);
      showResult('Comment permanently deleted.');
      onChanged();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete comment.');
    } finally { setWorking(false); }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={loading ? 'News Details' : 'News Details & Management'}
      size="xl"
      footer={news ? <>
        <Button variant="secondary" onClick={onClose}>Close</Button>
        {isArchived ? (
          <Button variant="secondary" icon={<RotateCcw size={16} />} loading={working} onClick={handleArchiveRestore}>Restore</Button>
        ) : (
          <Button variant="secondary" icon={<Archive size={16} />} loading={working} onClick={handleArchiveRestore}>Archive</Button>
        )}
        <Button variant="danger" icon={<Trash2 size={16} />} loading={working} onClick={handlePermanentDelete}>Delete Permanently</Button>
      </> : undefined}
    >
      {loading ? (
        <div className="py-16 text-center text-sm text-muted">Loading the complete news record…</div>
      ) : !news ? (
        <div className="py-10 text-center text-sm text-red-600">{error || 'News could not be loaded.'}</div>
      ) : (
        <div className="flex flex-col gap-6">
          {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
          {success && <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 flex items-center gap-2"><CheckCircle2 size={16} />{success}</div>}

          <div className="flex flex-wrap items-center gap-2">
            <Badge status={news.status} />
            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{news.createdByAdmin ? 'Official news' : 'Contributor submission'}</span>
            <span className="text-xs text-muted">Created {safeFormat(news.createdAt, 'MMM d, yyyy HH:mm')}</span>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              <Input label="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required />
              <Input label="Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                  {['Community', 'Education', 'Environment', 'Health', 'Events'].map(category => <option key={category}>{category}</option>)}
                </select>
              </div>
            </div>
            <Input label="Source URL" value={form.sourceUrl} onChange={e => setForm(f => ({ ...f, sourceUrl: e.target.value }))} placeholder="Optional original source" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea rows={5} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="text-xs text-muted">Editing here updates the stored news record. Newly added media is uploaded to Cloudinary before it is attached.</div>
              <Button type="submit" icon={<Save size={15} />} loading={saving}>Save Changes</Button>
            </div>
          </form>

          <section className="border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-4">
              <div><h3 className="font-semibold text-gray-900">Media</h3><p className="text-xs text-muted mt-0.5">{mediaCount} file{mediaCount === 1 ? '' : 's'} attached</p></div>
              <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-white">
                <UploadCloud size={15} /> Add Media
              </button>
              <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={e => setFiles(previous => [...previous, ...Array.from(e.target.files || [])].slice(0, 5))} />
            </div>
            {files.length > 0 && (
              <div className="px-5 pt-4 flex flex-wrap gap-2">
                {files.map((file, index) => <span key={`${file.name}-${index}`} className="inline-flex items-center gap-2 text-xs bg-primary-xlight text-primary px-2.5 py-1.5 rounded-full">{file.name}<button type="button" onClick={() => setFiles(previous => previous.filter((_, i) => i !== index))}><X size={12} /></button></span>)}
              </div>
            )}
            {news.media.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-muted">No media attached to this story.</div>
            ) : (
              <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
                {news.media.map((media, index) => (
                  <div key={`${media.publicId}-${index}`} className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <div className="aspect-[4/5] bg-gray-900 relative">
                      {media.type === 'video' ? (
                        <video src={media.url} poster={media.thumbnailUrl} controls className="w-full h-full object-cover" preload="metadata" />
                      ) : <img src={media.url} alt={`${news.title} ${index + 1}`} className="w-full h-full object-cover" />}
                      <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold flex items-center gap-1">{media.type === 'video' ? <Video size={11} /> : <ImageIcon size={11} />}{index + 1}</div>
                    </div>
                    <div className="p-3 flex items-center justify-between gap-2">
                      <span className="text-xs text-muted truncate">{media.publicId}</span>
                      <button type="button" disabled={working} onClick={() => void handleDeleteMedia(index)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 disabled:opacity-40" title="Delete media permanently"><Trash2 size={15} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Eye, label: 'Views', value: detail.engagement.views },
              { icon: HeartIcon, label: 'Likes', value: detail.engagement.likes },
              { icon: MessageCircle, label: 'Comments', value: detail.engagement.comments },
              { icon: Save, label: 'Saves', value: detail.engagement.saves },
            ].map(({ icon: Icon, label, value }) => <div key={label} className="p-4 rounded-xl bg-gray-50 border border-gray-100"><Icon size={17} className="text-muted" /><p className="text-xl font-bold text-gray-900 mt-2">{value}</p><p className="text-xs text-muted">{label}</p></div>)}
          </section>
          <p className="text-xs text-muted">Total tracked engagement actions: {totalEngagement}. Notification references to this story: {detail.notificationsCount}.</p>

          <section className="border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-100"><h3 className="font-semibold text-gray-900">Author & metadata</h3></div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100"><Avatar src={news.submittedBy?.profilePhoto || ''} name={news.submittedBy?.name || (news.createdByAdmin ? 'Admin' : 'Unknown')} size={44} /><div><p className="font-semibold text-sm text-gray-900">{news.submittedBy?.name || (news.createdByAdmin ? 'Official Admin' : 'Unknown')}</p><p className="text-xs text-muted">{news.submittedBy?.email || 'No contributor account attached'}</p></div></div>
              <div className="grid grid-cols-2 gap-3 text-sm"><div className="p-3 rounded-xl bg-gray-50"><span className="text-xs text-muted">Published</span><p className="font-medium">{news.publishedAt ? safeFormat(news.publishedAt, 'MMM d, yyyy HH:mm') : '—'}</p></div><div className="p-3 rounded-xl bg-gray-50"><span className="text-xs text-muted">Updated</span><p className="font-medium">{safeFormat(news.updatedAt, 'MMM d, yyyy HH:mm')}</p></div></div>
            </div>
          </section>

          <section className="border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-100"><h3 className="font-semibold text-gray-900">Internal Notes</h3><p className="text-xs text-muted mt-0.5">Private to administrators and persisted with this news record.</p></div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-gray-700 mb-2">Admin Notes</label><textarea rows={5} maxLength={5000} value={adminNotes} onChange={e => setAdminNotes(e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Private editorial or moderation notes…" /><p className="text-[11px] text-muted text-right mt-1">{adminNotes.length}/5000</p></div>
              <div><label className="block text-xs font-semibold text-gray-700 mb-2">Evidence Notes</label><textarea rows={5} maxLength={5000} value={evidenceNotes} onChange={e => setEvidenceNotes(e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Source verification or evidence notes…" /><p className="text-[11px] text-muted text-right mt-1">{evidenceNotes.length}/5000</p></div>
              <div className="md:col-span-2 flex justify-end"><Button variant="secondary" icon={<Save size={15} />} loading={working} onClick={() => void handleSaveNotes()}>Save Internal Notes</Button></div>
            </div>
          </section>

          <section className="border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2"><MessageCircle size={17} className="text-muted" /><h3 className="font-semibold text-gray-900">Comments</h3><span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{detail.comments.length}</span></div>
            {detail.comments.length === 0 ? <div className="px-5 py-10 text-center text-sm text-muted">No comments on this story.</div> : <div className="divide-y divide-gray-100">{detail.comments.map(comment => <div key={comment._id} className="p-4 flex gap-3"><Avatar src={comment.user?.profilePhoto || ''} name={comment.user?.name || 'User'} size={34} /><div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><div><p className="text-sm font-semibold text-gray-900">{comment.user?.name || 'Unknown User'}</p><p className="text-xs text-muted">{safeFormat(comment.createdAt, 'MMM d, yyyy HH:mm')}</p></div><button type="button" disabled={working} onClick={() => void handleDeleteComment(comment._id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-40"><Trash2 size={14} /></button></div><p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{comment.text}</p></div></div>)}</div>}
          </section>

          <section className="border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-100"><h3 className="font-semibold text-gray-900">Revision history</h3></div>
            {detail.revisions.length === 0 ? <div className="px-5 py-10 text-center text-sm text-muted">No revisions recorded for this item.</div> : <div className="divide-y divide-gray-100">{detail.revisions.map(revision => <div key={revision._id} className="p-4 flex justify-between gap-4"><div><p className="text-sm font-semibold text-gray-900">Revision {revision.revisionNumber}</p><p className="text-xs text-muted mt-1">{revision.changeNote || 'No change note'} · {revision.author?.name || 'Unknown admin'}</p></div><span className="text-xs text-muted whitespace-nowrap">{safeFormat(revision.createdAt, 'MMM d, yyyy HH:mm')}</span></div>)}</div>}
          </section>
        </div>
      )}
    </Modal>
  );
};

const HeartIcon: React.FC<{ size?: number; className?: string }> = ({ size, className }) => <svg width={size || 18} height={size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" /></svg>;

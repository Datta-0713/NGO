import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BookOpen,
  Calendar,
  Check,
  Coins,
  FileText,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  RefreshCw,
  Save,
  Send,
  StickyNote,
  UserRound,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { safeFormat } from '@/utils/date';
import { creditsApi } from '@/api/creditsApi';
import { getUserById, updateUserNotes } from '@/api/usersApi';
import type {
  User,
  UserActivityComment,
  UserActivityCreditTransaction,
  UserActivityLike,
  UserActivityNews,
  UserActivityNotification,
  UserActivitySave,
  UserDetailActivity,
} from '@/types';

interface UserDetailModalProps {
  user: User;
  onClose: () => void;
}

type Tab = 'overview' | 'activity' | 'notes';

const EMPTY_ACTIVITY: UserDetailActivity = {
  counts: {
    submittedNews: 0,
    comments: 0,
    likes: 0,
    saves: 0,
    creditTransactions: 0,
    notifications: 0,
    unreadNotifications: 0,
  },
  recent: {
    submittedNews: [],
    comments: [],
    likes: [],
    saves: [],
    creditTransactions: [],
    notifications: [],
  },
};

const messageFromError = (error: unknown, fallback: string) => {
  const maybeAxios = error as { response?: { data?: { message?: string } } };
  return maybeAxios?.response?.data?.message || fallback;
};

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; count?: number }> = ({ icon, title, count }) => (
  <div className="flex items-center justify-between gap-3 mb-3">
    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
      <span className="text-muted">{icon}</span>
      <span>{title}</span>
    </div>
    {typeof count === 'number' && <span className="text-xs font-semibold text-muted bg-gray-100 rounded-full px-2 py-1">{count}</span>}
  </div>
);

const ActivityNewsRow: React.FC<{ item: UserActivityNews }> = ({ item }) => (
  <div className="flex items-start justify-between gap-3 p-3 rounded-xl border border-gray-100 bg-white">
    <div className="min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
      <p className="text-xs text-muted mt-1">
        {item.category || 'News'}{item.location ? ` • ${item.location}` : ''} • {safeFormat(item.createdAt, 'MMM d, yyyy HH:mm')}
      </p>
    </div>
    <Badge status={item.status} />
  </div>
);

const ActivityCommentRow: React.FC<{ item: UserActivityComment }> = ({ item }) => (
  <div className="p-3 rounded-xl border border-gray-100 bg-white">
    <div className="flex items-center justify-between gap-3 mb-1">
      <p className="text-xs font-semibold text-gray-700 truncate">{item.news?.title || 'News item unavailable'}</p>
      <span className="text-[11px] text-muted whitespace-nowrap">{safeFormat(item.createdAt, 'MMM d, HH:mm')}</span>
    </div>
    <p className={`text-sm leading-5 ${item.deletedAt ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{item.text}</p>
    {item.deletedAt && <p className="text-[11px] text-red-500 mt-1">Deleted</p>}
  </div>
);

const ActivityLikeOrSaveRow: React.FC<{ item: UserActivityLike | UserActivitySave; label: 'Liked' | 'Saved' }> = ({ item, label }) => (
  <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 bg-white">
    <div className="min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">{item.news?.title || 'News item unavailable'}</p>
      <p className="text-xs text-muted mt-1">{label} • {safeFormat(item.createdAt, 'MMM d, yyyy HH:mm')}</p>
    </div>
    {item.news?.status && <Badge status={item.news.status} />}
  </div>
);

const ActivityCreditRow: React.FC<{ item: UserActivityCreditTransaction }> = ({ item }) => (
  <div className="flex items-start justify-between gap-3 p-3 rounded-xl border border-gray-100 bg-white">
    <div className="min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">{item.reason}</p>
      <p className="text-xs text-muted mt-1">{item.relatedNews?.title || 'Account credit activity'} • {safeFormat(item.createdAt, 'MMM d, yyyy HH:mm')}</p>
    </div>
    <span className={`text-sm font-bold whitespace-nowrap ${item.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
      {item.type === 'credit' ? '+' : '-'}{item.amount}
    </span>
  </div>
);

const ActivityNotificationRow: React.FC<{ item: UserActivityNotification }> = ({ item }) => (
  <div className={`p-3 rounded-xl border ${item.read ? 'border-gray-100 bg-white' : 'border-primary/20 bg-primary-xlight/30'}`}>
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
      {!item.read && <span className="text-[10px] font-bold uppercase tracking-wide text-primary">Unread</span>}
    </div>
    <p className="text-sm text-gray-600 mt-1">{item.message}</p>
    <p className="text-xs text-muted mt-2">{safeFormat(item.createdAt, 'MMM d, yyyy HH:mm')}</p>
  </div>
);

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {
  const [tab, setTab] = useState<Tab>('overview');
  const [detail, setDetail] = useState<User>(user);
  const [activity, setActivity] = useState<UserDetailActivity>(EMPTY_ACTIVITY);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesError, setNotesError] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [form, setForm] = useState({ amount: '', reason: '', action: 'credit' as 'credit' | 'debit' });
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState('');
  const [adjustSuccess, setAdjustSuccess] = useState(false);
  const [currentCredits, setCurrentCredits] = useState(user.credits);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    setNotesError('');
    try {
      const response = await getUserById(user._id);
      const payload = response?.data;
      if (!payload?.user) throw new Error('The user detail response was incomplete.');
      setDetail(payload.user);
      setActivity(payload.activity || EMPTY_ACTIVITY);
      setNotes(String(payload.notes?.adminNotes || ''));
      setCurrentCredits(payload.user.credits);
    } catch (err) {
      setError(messageFromError(err, 'Failed to load the complete user profile.'));
    } finally {
      setLoading(false);
    }
  }, [user._id]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getUserById(user._id);
        if (!mounted) return;
        const payload = response?.data;
        if (!payload?.user) throw new Error('The user detail response was incomplete.');
        setDetail(payload.user);
        setActivity(payload.activity || EMPTY_ACTIVITY);
        setNotes(String(payload.notes?.adminNotes || ''));
        setCurrentCredits(payload.user.credits);
      } catch (err) {
        if (mounted) setError(messageFromError(err, 'Failed to load the complete user profile.'));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void run();
    return () => { mounted = false; };
  }, [user._id]);

  const handleSaveNotes = async () => {
    setNotesSaving(true);
    setNotesError('');
    setNotesSaved(false);
    try {
      const response = await updateUserNotes(user._id, notes);
      setNotes(String(response?.data?.notes?.adminNotes ?? notes));
      setNotesSaved(true);
      window.setTimeout(() => setNotesSaved(false), 1800);
    } catch (err) {
      setNotesError(messageFromError(err, 'Failed to save admin notes.'));
    } finally {
      setNotesSaving(false);
    }
  };

  const handleAdjust = async () => {
    if (!form.amount || !form.reason.trim()) {
      setAdjustError('Amount and reason are required.');
      return;
    }
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setAdjustError('Enter a valid amount greater than zero.');
      return;
    }
    setAdjusting(true);
    setAdjustError('');
    try {
      const result = await creditsApi.adjustCredits(user._id, amount, form.reason.trim(), form.action);
      const nextCredits = result?.data?.user?.credits;
      setCurrentCredits(typeof nextCredits === 'number' ? nextCredits : currentCredits + (form.action === 'credit' ? amount : -amount));
      setAdjustSuccess(true);
      setForm({ amount: '', reason: '', action: 'credit' });
      await loadDetail();
      window.setTimeout(() => { setAdjustOpen(false); setAdjustSuccess(false); }, 1200);
    } catch (err) {
      setAdjustError(messageFromError(err, 'Failed to adjust credits.'));
    } finally {
      setAdjusting(false);
    }
  };

  const activitySummary = useMemo(() => [
    { icon: BookOpen, label: 'Stories', value: activity.counts.submittedNews },
    { icon: MessageCircle, label: 'Comments', value: activity.counts.comments },
    { icon: Heart, label: 'Likes', value: activity.counts.likes },
    { icon: Save, label: 'Saves', value: activity.counts.saves },
    { icon: Coins, label: 'Credit events', value: activity.counts.creditTransactions },
    { icon: Send, label: 'Notifications', value: activity.counts.notifications },
  ], [activity]);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={loading ? 'Contributor Profile' : `${detail.name || user.name} · Contributor Profile`}
      size="lg"
    >
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-4">
          <LoadingSpinner size="lg" />
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900">Loading complete profile…</p>
            <p className="text-xs text-muted mt-1">Fetching account activity, content history and admin notes.</p>
          </div>
        </div>
      ) : error ? (
        <div className="py-12 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
            <RefreshCw size={20} />
          </div>
          <h3 className="text-base font-semibold text-gray-900">Unable to load profile</h3>
          <p className="text-sm text-red-600 mt-2 max-w-md">{error}</p>
          <Button className="mt-5" variant="secondary" icon={<RefreshCw size={15} />} onClick={() => void loadDetail()}>
            Retry
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar src={detail.profilePhoto} name={detail.name} size={64} />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-gray-900 truncate">{detail.name}</h3>
                  <Badge status={detail.role} />
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${detail.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {detail.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-muted mt-1 truncate">{detail.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted shrink-0">
              <Calendar size={14} />
              Joined {safeFormat(detail.createdAt, 'MMM d, yyyy')}
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {activitySummary.map(({ icon: Icon, label, value }) => (
              <div key={label} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                <Icon size={16} className="mx-auto text-muted" />
                <p className="text-lg font-bold text-gray-900 mt-1">{value}</p>
                <p className="text-[10px] text-muted leading-3">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 overflow-x-auto">
            {([
              ['overview', 'Overview', UserRound],
              ['activity', 'Activity', Activity],
              ['notes', 'Admin Notes', StickyNote],
            ] as const).map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={`flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${tab === value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="flex flex-col gap-5">
              {detail.bio && (
                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">Bio</p>
                  <p className="text-sm text-gray-700 leading-6">{detail.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { icon: Mail, label: 'Email', value: detail.email },
                  { icon: MapPin, label: 'Location', value: detail.location || 'Not specified' },
                  { icon: Calendar, label: 'Created', value: safeFormat(detail.createdAt, 'MMM d, yyyy HH:mm') },
                  { icon: Calendar, label: 'Last Updated', value: safeFormat(detail.updatedAt, 'MMM d, yyyy HH:mm') },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <Icon size={16} className="text-muted mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted">{label}</p>
                      <p className="text-sm font-medium text-gray-900 break-words">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">Contributor totals</p>
                </div>
                <div className="grid grid-cols-3 divide-x divide-gray-100">
                  <div className="p-4 text-center"><p className="text-2xl font-bold text-gray-900">{detail.storiesCount}</p><p className="text-xs text-muted mt-1">Stored stories</p></div>
                  <div className="p-4 text-center"><p className="text-2xl font-bold text-gray-900">{detail.likesReceived}</p><p className="text-xs text-muted mt-1">Likes received</p></div>
                  <div className="p-4 text-center"><p className="text-2xl font-bold text-gray-900">{currentCredits}</p><p className="text-xs text-muted mt-1">Credits</p></div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                {!adjustOpen ? (
                  <Button variant="secondary" size="sm" icon={<Coins size={14} />} onClick={() => setAdjustOpen(true)} className="w-full">
                    Adjust Credits
                  </Button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-gray-800">Adjust Credits</p>
                      <button type="button" className="text-xs text-muted hover:text-gray-900" onClick={() => setAdjustOpen(false)}>Close</button>
                    </div>
                    {adjustSuccess && <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 text-center">Credits adjusted successfully.</div>}
                    {adjustError && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{adjustError}</div>}
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setForm(f => ({ ...f, action: 'credit' }))} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${form.action === 'credit' ? 'border-primary bg-primary-xlight text-primary' : 'border-gray-200 text-gray-500'}`}>Credit</button>
                      <button type="button" onClick={() => setForm(f => ({ ...f, action: 'debit' }))} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${form.action === 'debit' ? 'border-red-300 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500'}`}>Debit</button>
                    </div>
                    <Input label="Amount" type="number" min="1" placeholder="e.g. 10" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Reason</label>
                      <textarea rows={2} placeholder="Why is this adjustment being made?" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => { setAdjustOpen(false); setAdjustError(''); }} className="flex-1">Cancel</Button>
                      <Button size="sm" loading={adjusting} onClick={() => void handleAdjust()} disabled={adjustSuccess} className="flex-1">Confirm</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'activity' && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  ['Submitted news', activity.counts.submittedNews],
                  ['Comments', activity.counts.comments],
                  ['Likes', activity.counts.likes],
                  ['Saved stories', activity.counts.saves],
                  ['Credit events', activity.counts.creditTransactions],
                  ['Notifications', activity.counts.notifications],
                  ['Unread', activity.counts.unreadNotifications],
                ].map(([label, value]) => (
                  <div key={String(label)} className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <p className="text-xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-muted mt-1">{label}</p>
                  </div>
                ))}
              </div>

              <section>
                <SectionHeader icon={<FileText size={16} />} title="Recent submissions" count={activity.recent.submittedNews.length} />
                {activity.recent.submittedNews.length ? (
                  <div className="flex flex-col gap-2">{activity.recent.submittedNews.map(item => <ActivityNewsRow key={item._id} item={item} />)}</div>
                ) : <EmptyState title="No submitted news" description="This account has no stored news submissions." />}
              </section>

              <section>
                <SectionHeader icon={<MessageCircle size={16} />} title="Recent comments" count={activity.recent.comments.length} />
                {activity.recent.comments.length ? (
                  <div className="flex flex-col gap-2">{activity.recent.comments.map(item => <ActivityCommentRow key={item._id} item={item} />)}</div>
                ) : <EmptyState title="No comments" description="No comments were found for this account." />}
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <section>
                  <SectionHeader icon={<Heart size={16} />} title="Recent likes" count={activity.recent.likes.length} />
                  {activity.recent.likes.length ? <div className="flex flex-col gap-2">{activity.recent.likes.map(item => <ActivityLikeOrSaveRow key={item._id} item={item} label="Liked" />)}</div> : <EmptyState title="No likes" description="No likes were found for this account." />}
                </section>
                <section>
                  <SectionHeader icon={<Save size={16} />} title="Recent saves" count={activity.recent.saves.length} />
                  {activity.recent.saves.length ? <div className="flex flex-col gap-2">{activity.recent.saves.map(item => <ActivityLikeOrSaveRow key={item._id} item={item} label="Saved" />)}</div> : <EmptyState title="No saved stories" description="No saved stories were found for this account." />}
                </section>
              </div>

              <section>
                <SectionHeader icon={<Coins size={16} />} title="Credit history" count={activity.recent.creditTransactions.length} />
                {activity.recent.creditTransactions.length ? <div className="flex flex-col gap-2">{activity.recent.creditTransactions.map(item => <ActivityCreditRow key={item._id} item={item} />)}</div> : <EmptyState title="No credit transactions" description="No credit adjustments or awards were found." />}
              </section>

              <section>
                <SectionHeader icon={<Send size={16} />} title="Recent notifications" count={activity.recent.notifications.length} />
                {activity.recent.notifications.length ? <div className="flex flex-col gap-2">{activity.recent.notifications.map(item => <ActivityNotificationRow key={item._id} item={item} />)}</div> : <EmptyState title="No notifications" description="No notifications were found for this account." />}
              </section>
            </div>
          )}

          {tab === 'notes' && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Internal admin notes</p>
                <p className="text-xs text-muted mt-1">These notes are private to administrators and are persisted separately from the public profile.</p>
              </div>
              {notesError && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{notesError}</div>}
              {notesSaved && <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 flex items-center gap-2"><Check size={16} /> Notes saved successfully.</div>}
              <textarea
                rows={12}
                maxLength={5000}
                value={notes}
                onChange={e => { setNotes(e.target.value); setNotesSaved(false); setNotesError(''); }}
                placeholder="Record moderation context, support notes, account history, or follow-up items…"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary resize-y"
              />
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted">{notes.length.toLocaleString()}/5,000 characters</span>
                <Button loading={notesSaving} icon={<Save size={15} />} onClick={() => void handleSaveNotes()}>Save Notes</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

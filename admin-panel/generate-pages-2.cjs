const fs = require('fs');
const path = require('path');

const root = 'd:/NGO/admin-panel';

const files = {
  'src/pages/Submissions/components/SubmissionCard.tsx': `import React from 'react';
import { NewsItem } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { MapPin, Calendar } from 'lucide-react';

export const SubmissionCard = ({ item, onClick }: { item: NewsItem, onClick: () => void }) => {
  return (
    <div onClick={onClick} style={{ backgroundColor: '#FFF', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ position: 'relative', height: 160, backgroundColor: '#E5E7EB' }}>
        {item.media[0]?.url && <img src={item.media[0].url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <Badge status={item.status} />
        </div>
      </div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6B7280' }}>
          <MapPin size={14} /> {item.location}
          <span style={{ margin: '0 4px' }}>•</span>
          <Calendar size={14} /> {new Date(item.createdAt).toLocaleDateString()}
        </div>
        <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar name={item.submittedBy?.name || 'Unknown'} size={24} src={item.submittedBy?.profilePhoto} />
          <span style={{ fontSize: '12px', fontWeight: 500 }}>{item.submittedBy?.name || 'Unknown'}</span>
        </div>
      </div>
    </div>
  );
};`,

  'src/pages/Submissions/components/SubmissionDetailModal.tsx': `import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { NewsItem } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { MapPin, Calendar, Tag } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { approveSubmission, rejectSubmission } from '@/store/slices/submissionsSlice';

export const SubmissionDetailModal = ({ isOpen, onClose, submission, onActionComplete }: { isOpen: boolean, onClose: () => void, submission: NewsItem | null, onActionComplete: () => void }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState('');

  if (!submission) return null;

  const handleApprove = () => {
    dispatch(approveSubmission(submission._id)).then(() => {
      onActionComplete();
      onClose();
    });
  };

  const handleReject = () => {
    if (rejectMode) {
      dispatch(rejectSubmission({ id: submission._id, msg: rejectionMessage })).then(() => {
        setRejectMode(false);
        setRejectionMessage('');
        onActionComplete();
        onClose();
      });
    } else {
      setRejectMode(true);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Submission">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Avatar name={submission.submittedBy?.name || 'Unknown'} size={40} src={submission.submittedBy?.profilePhoto} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>{submission.submittedBy?.name}</div>
              <div style={{ color: '#6B7280', fontSize: '12px' }}>{submission.submittedBy?.email}</div>
            </div>
          </div>
          <Badge status={submission.status} />
        </div>

        {submission.media.length > 0 && (
          <div style={{ borderRadius: 8, overflow: 'hidden', backgroundColor: '#E5E7EB', maxHeight: 300, display: 'flex', justifyContent: 'center' }}>
            {submission.media[0].type === 'image' ? (
              <img src={submission.media[0].url} style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }} alt="Media" />
            ) : (
              <video src={submission.media[0].url} controls style={{ maxWidth: '100%', maxHeight: '300px' }} />
            )}
          </div>
        )}

        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0' }}>{submission.title}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: '#6B7280', fontSize: '14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={16} /> {submission.location}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={16} /> {new Date(submission.date).toLocaleDateString()}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Tag size={16} /> {submission.category}</div>
          </div>
          <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#374151', whiteSpace: 'pre-wrap' }}>{submission.description}</p>
        </div>

        {submission.status === 'pending' && (
          <div style={{ marginTop: '20px', borderTop: '1px solid #E5E7EB', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rejectMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <textarea 
                  placeholder="Provide a reason for rejection..." 
                  value={rejectionMessage} 
                  onChange={(e) => setRejectionMessage(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E5E7EB', outline: 'none', resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <Button variant="secondary" onClick={() => setRejectMode(false)}>Cancel</Button>
                  <Button variant="danger" onClick={handleReject} disabled={!rejectionMessage.trim()}>Confirm Rejection</Button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <Button variant="danger" onClick={handleReject}>Reject</Button>
                <Button variant="primary" onClick={handleApprove}>Approve & Publish</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};`,

  'src/pages/Submissions/SubmissionsPage.tsx': `import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchSubmissions } from '@/store/slices/submissionsSlice';
import { SubmissionCard } from './components/SubmissionCard';
import { SubmissionDetailModal } from './components/SubmissionDetailModal';
import { Input } from '@/components/ui/Input';
import { SUBMISSION_STATUSES } from '@/constants';

const SubmissionsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading } = useSelector((state: RootState) => state.submissions);
  const [filter, setFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  const loadSubmissions = () => {
    dispatch(fetchSubmissions({ status: filter === 'all' ? undefined : filter }));
  };

  useEffect(() => {
    loadSubmissions();
  }, [dispatch, filter]);

  return (
    <div className="flex flex-col gap-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="text-2xl font-bold">Submissions Review</h1>
        <div style={{ width: 250 }}><Input placeholder="Search submissions..." /></div>
      </div>
      
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
        <button onClick={() => setFilter('all')} style={{ padding: '6px 12px', borderRadius: 20, backgroundColor: filter === 'all' ? '#2D6A4F' : '#F3F4F6', color: filter === 'all' ? '#FFF' : '#374151', fontSize: 14, fontWeight: 500 }}>All</button>
        {SUBMISSION_STATUSES.map(status => (
          <button key={status} onClick={() => setFilter(status)} style={{ padding: '6px 12px', borderRadius: 20, backgroundColor: filter === status ? '#2D6A4F' : '#F3F4F6', color: filter === status ? '#FFF' : '#374151', fontSize: 14, fontWeight: 500, textTransform: 'capitalize' }}>
            {status}
          </button>
        ))}
      </div>

      {loading ? <div className="text-center p-8">Loading...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {items.map(item => (
            <SubmissionCard key={item._id} item={item} onClick={() => setSelectedSubmission(item)} />
          ))}
        </div>
      )}

      <SubmissionDetailModal 
        isOpen={!!selectedSubmission} 
        onClose={() => setSelectedSubmission(null)} 
        submission={selectedSubmission} 
        onActionComplete={loadSubmissions} 
      />
    </div>
  );
};
export default SubmissionsPage;`,

  'src/pages/Users/components/UserDetailModal.tsx': `import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { User } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { FileText, ThumbsUp, Coins, MapPin } from 'lucide-react';

export const UserDetailModal = ({ isOpen, onClose, user }: { isOpen: boolean, onClose: () => void, user: User | null }) => {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Profile">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Avatar name={user.name} size={80} src={user.profilePhoto} />
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0' }}>{user.name}</h2>
            <div style={{ color: '#6B7280', fontSize: '14px', marginBottom: '8px' }}>{user.email}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#374151' }}>
              <MapPin size={16} className="text-muted" /> {user.location || 'Location not provided'}
            </div>
          </div>
        </div>
        
        {user.bio && (
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', margin: '0 0 8px 0' }}>Bio</h4>
            <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>{user.bio}</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '8px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <FileText size={24} className="text-primary" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '20px', fontWeight: 700 }}>{user.storiesCount}</div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>Stories</div>
          </div>
          <div style={{ backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '8px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ThumbsUp size={24} className="text-primary" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '20px', fontWeight: 700 }}>{user.likesReceived}</div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>Likes Received</div>
          </div>
          <div style={{ backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '8px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Coins size={24} style={{ color: '#F59E0B', marginBottom: '8px' }} />
            <div style={{ fontSize: '20px', fontWeight: 700 }}>{user.credits}</div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>Credits Balance</div>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', marginTop: '16px' }}>
          Joined {new Date(user.createdAt).toLocaleDateString()}
        </div>
      </div>
    </Modal>
  );
};`,

  'src/pages/Users/UsersPage.tsx': `import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchUsers } from '@/store/slices/usersSlice';
import { Table } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { UserDetailModal } from './components/UserDetailModal';

const UsersPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading } = useSelector((state: RootState) => state.users);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchUsers({}));
  }, [dispatch]);

  return (
    <div className="flex flex-col gap-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="text-2xl font-bold">User Management</h1>
        <div style={{ width: 300 }}><Input placeholder="Search by name or email..." /></div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        {loading ? <div>Loading...</div> : (
          <Table>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 500, color: '#6B7280', fontSize: '12px', textTransform: 'uppercase' }}>User</th>
                <th style={{ padding: '12px 16px', fontWeight: 500, color: '#6B7280', fontSize: '12px', textTransform: 'uppercase' }}>Location</th>
                <th style={{ padding: '12px 16px', fontWeight: 500, color: '#6B7280', fontSize: '12px', textTransform: 'uppercase', textAlign: 'center' }}>Stories</th>
                <th style={{ padding: '12px 16px', fontWeight: 500, color: '#6B7280', fontSize: '12px', textTransform: 'uppercase', textAlign: 'center' }}>Credits</th>
                <th style={{ padding: '12px 16px', fontWeight: 500, color: '#6B7280', fontSize: '12px', textTransform: 'uppercase' }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {items.map((user) => (
                <tr key={user._id} style={{ borderBottom: '1px solid #E5E7EB', cursor: 'pointer' }} onClick={() => setSelectedUser(user)} className="hover:bg-gray-50">
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Avatar name={user.name} size={40} src={user.profilePhoto} />
                      <div>
                        <div style={{ fontWeight: 500, color: '#111827', fontSize: '14px' }}>{user.name}</div>
                        <div style={{ color: '#6B7280', fontSize: '12px' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>{user.location || '-'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', textAlign: 'center' }}>{user.storiesCount}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', textAlign: 'center', fontWeight: 600, color: '#F59E0B' }}>{user.credits}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6B7280' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      <UserDetailModal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} user={selectedUser} />
    </div>
  );
};
export default UsersPage;`,

  'src/pages/Credits/CreditsPage.tsx': `import React, { useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

const CreditsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div className="flex flex-col gap-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="text-2xl font-bold">Credits Management</h1>
        <Button onClick={() => setIsModalOpen(true)}>Adjust Credits</Button>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-bold mb-4">Recent Transactions</h2>
        <Table>
          <thead>
            <tr style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', textAlign: 'left' }}>
              <th style={{ padding: '12px 16px', fontWeight: 500, color: '#6B7280', fontSize: '12px', textTransform: 'uppercase' }}>User</th>
              <th style={{ padding: '12px 16px', fontWeight: 500, color: '#6B7280', fontSize: '12px', textTransform: 'uppercase' }}>Amount</th>
              <th style={{ padding: '12px 16px', fontWeight: 500, color: '#6B7280', fontSize: '12px', textTransform: 'uppercase' }}>Reason</th>
              <th style={{ padding: '12px 16px', fontWeight: 500, color: '#6B7280', fontSize: '12px', textTransform: 'uppercase' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>No transactions found.</td>
            </tr>
          </tbody>
        </Table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adjust User Credits">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="User ID" placeholder="Enter User ID" />
          <Input label="Amount (+/-)" type="number" placeholder="e.g. 50 or -20" />
          <Input label="Reason" placeholder="Reason for adjustment" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>Submit Adjustment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default CreditsPage;`,

  'src/pages/Notifications/NotificationsPage.tsx': `import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Bell } from 'lucide-react';

const NotificationsPage = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Notification sent!');
    setTitle('');
    setMessage('');
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Notifications</h1>
      
      <div className="bg-white p-6 rounded shadow w-full max-w-2xl">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#e6f4ea', padding: '12px', borderRadius: '8px', color: '#2D6A4F' }}>
            <Bell size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Broadcast Notification</h2>
            <p className="text-sm text-muted">Send a push notification to all app users.</p>
          </div>
        </div>

        <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Notification Title" value={title} onChange={(e: any) => setTitle(e.target.value)} required placeholder="e.g. New Event Scheduled!" />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Message</label>
            <textarea 
              rows={4} 
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #E5E7EB', outline: 'none', fontFamily: 'inherit' }} 
              value={message} 
              onChange={(e: any) => setMessage(e.target.value)} 
              required 
              placeholder="Enter the notification message here..."
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button type="submit">Send Broadcast</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default NotificationsPage;`,

  'src/pages/Settings/SettingsPage.tsx': `import React from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const SettingsPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Platform Settings</h1>
      
      <div className="bg-white p-6 rounded shadow w-full max-w-2xl">
        <h2 className="text-lg font-bold mb-6 border-b pb-4">General Settings</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Input label="Platform Name" defaultValue="NEXY Foundation" />
          <Input label="Default credits for approved submission" type="number" defaultValue={50} />
          <Input label="Welcome bonus credits for new users" type="number" defaultValue={10} />
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Active Categories</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Community', 'Education', 'Environment', 'Health', 'Events'].map(cat => (
                <span key={cat} style={{ backgroundColor: '#F3F4F6', padding: '6px 12px', borderRadius: '16px', fontSize: '14px', border: '1px solid #E5E7EB' }}>
                  {cat}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted mt-1">Categories are currently fixed and cannot be edited.</p>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid #E5E7EB', paddingTop: '20px' }}>
            <Button>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;`
};

Object.entries(files).forEach(([filepath, content]) => {
  const fullPath = path.join(root, filepath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content);
});

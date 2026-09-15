const fs = require('fs');
const path = require('path');

const root = 'd:/NGO/admin-panel';

const files = {
  'src/pages/Dashboard/components/SubmissionsChart.tsx': `import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export const SubmissionsChart = ({ data }: { data: { date: string; count: number }[] }) => {
  return (
    <div style={{ height: 300, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
          <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
          <Area type="monotone" dataKey="count" stroke="#2D6A4F" fillOpacity={1} fill="url(#colorCount)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};`,

  'src/pages/Dashboard/components/RecentSubmissionsTable.tsx': `import React from 'react';
import { NewsItem } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Table } from '@/components/ui/Table';

export const RecentSubmissionsTable = ({ items }: { items: NewsItem[] }) => {
  return (
    <Table>
      <thead>
        <tr style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', textAlign: 'left' }}>
          <th style={{ padding: '12px 16px', fontWeight: 500, color: '#6B7280', fontSize: '12px', textTransform: 'uppercase' }}>News</th>
          <th style={{ padding: '12px 16px', fontWeight: 500, color: '#6B7280', fontSize: '12px', textTransform: 'uppercase' }}>Contributor</th>
          <th style={{ padding: '12px 16px', fontWeight: 500, color: '#6B7280', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
          <th style={{ padding: '12px 16px', fontWeight: 500, color: '#6B7280', fontSize: '12px', textTransform: 'uppercase' }}>Date</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item._id} style={{ borderBottom: '1px solid #E5E7EB' }}>
            <td style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 48, height: 48, borderRadius: 6, backgroundColor: '#E5E7EB', overflow: 'hidden' }}>
                  {item.media[0]?.url && <img src={item.media[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div>
                  <div style={{ fontWeight: 500, color: '#111827', fontSize: '14px' }}>{item.title}</div>
                  <div style={{ color: '#6B7280', fontSize: '12px' }}>{item.category}</div>
                </div>
              </div>
            </td>
            <td style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar name={item.submittedBy?.name || 'Unknown'} size={28} src={item.submittedBy?.profilePhoto} />
                <span style={{ fontSize: '14px' }}>{item.submittedBy?.name || 'Unknown'}</span>
              </div>
            </td>
            <td style={{ padding: '12px 16px' }}>
              <Badge status={item.status} />
            </td>
            <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6B7280' }}>
              {new Date(item.createdAt).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};`,

  'src/pages/Dashboard/components/NeedsAttentionPanel.tsx': `import React from 'react';
import { AlertCircle, UserPlus, Coins } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NeedsAttentionPanel = ({ data }: { data: any }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ backgroundColor: '#FEF3C7', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <AlertCircle className="text-warning" size={24} />
        <div>
          <h4 style={{ fontWeight: 600, color: '#92400E', margin: '0 0 4px 0' }}>{data?.pendingSubmissions || 0} Pending Submissions</h4>
          <p style={{ color: '#B45309', fontSize: '14px', margin: '0 0 8px 0' }}>Require your review before publishing.</p>
          <Link to="/submissions" style={{ color: '#92400E', fontSize: '14px', fontWeight: 600 }}>Review Now &rarr;</Link>
        </div>
      </div>
      
      <div style={{ backgroundColor: '#E0E7FF', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <UserPlus style={{ color: '#4338CA' }} size={24} />
        <div>
          <h4 style={{ fontWeight: 600, color: '#3730A3', margin: '0 0 4px 0' }}>{data?.newContributorsThisMonth || 0} New Contributors</h4>
          <p style={{ color: '#4F46E5', fontSize: '14px', margin: '0 0 8px 0' }}>Joined the platform this month.</p>
          <Link to="/users" style={{ color: '#3730A3', fontSize: '14px', fontWeight: 600 }}>View Users &rarr;</Link>
        </div>
      </div>
      
      <div style={{ backgroundColor: '#DCFCE7', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <Coins style={{ color: '#15803D' }} size={24} />
        <div>
          <h4 style={{ fontWeight: 600, color: '#166534', margin: '0 0 4px 0' }}>{data?.creditsToBeAwarded || 0} Credits Pending</h4>
          <p style={{ color: '#16A34A', fontSize: '14px', margin: '0 0 8px 0' }}>To be awarded for pending submissions.</p>
          <Link to="/credits" style={{ color: '#166534', fontSize: '14px', fontWeight: 600 }}>Manage Credits &rarr;</Link>
        </div>
      </div>
    </div>
  );
};`,

  'src/pages/Dashboard/DashboardPage.tsx': `import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchDashboardStats } from '@/store/slices/dashboardSlice';
import { StatCard } from '@/components/ui/StatCard';
import { FileText, CheckSquare, Users, Coins } from 'lucide-react';
import { SubmissionsChart } from './components/SubmissionsChart';
import { RecentSubmissionsTable } from './components/RecentSubmissionsTable';
import { NeedsAttentionPanel } from './components/NeedsAttentionPanel';

const DashboardPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, loading } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading) return <div className="p-8 text-center text-primary">Loading dashboard...</div>;
  if (!stats) return <div className="p-8 text-center text-muted">No dashboard data available.</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-4 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <StatCard title="Published News" value={stats.publishedNewsCount} icon={FileText} change={12} trendUp={true} />
        <StatCard title="Pending Review" value={stats.pendingCount} icon={CheckSquare} change={5} trendUp={false} />
        <StatCard title="Total Contributors" value={stats.totalContributors} icon={Users} change={18} trendUp={true} />
        <StatCard title="Credits Awarded" value={stats.totalCreditsAwarded} icon={Coins} change={2} trendUp={true} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-bold mb-4">Recent Submissions</h2>
            <RecentSubmissionsTable items={stats.recentSubmissions || []} />
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-bold mb-4">Needs Your Attention</h2>
            <NeedsAttentionPanel data={stats.needsAttentionData} />
          </div>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-bold mb-4">News Submissions (Past 30 Days)</h2>
          <SubmissionsChart data={stats.submissionsLast30Days || []} />
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px' }}>
              <span className="text-muted">Total Submissions</span>
              <span className="font-bold">{stats.submissionsLast30Days?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px' }}>
              <span className="text-muted">This Month</span>
              <span className="font-bold">{stats.submissionsLast30Days?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">Daily Average</span>
              <span className="font-bold">{Math.round((stats.submissionsLast30Days?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 0) / 30)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;`,

  'src/pages/News/components/CreateNewsForm.tsx': `import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CATEGORIES } from '@/constants';
import { useDispatch } from 'react-redux';
import { createNews } from '@/store/slices/newsSlice';
import { AppDispatch } from '@/store';

export const CreateNewsForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState({ title: '', description: '', location: '', date: '', category: CATEGORIES[0] });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (file) data.append('media', file);
    dispatch(createNews(data));
    setFormData({ title: '', description: '', location: '', date: '', category: CATEGORIES[0] });
    setFile(null);
    setPreview('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow flex flex-col gap-4">
      <h2 className="text-lg font-bold">Publish News</h2>
      <Input label="Title" value={formData.title} onChange={(e: any) => setFormData({...formData, title: e.target.value})} required />
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Description</label>
        <textarea rows={4} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #E5E7EB', outline: 'none' }} value={formData.description} onChange={(e: any) => setFormData({...formData, description: e.target.value})} required />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <Input label="Location" value={formData.location} onChange={(e: any) => setFormData({...formData, location: e.target.value})} required />
        <Input label="Date" type="date" value={formData.date} onChange={(e: any) => setFormData({...formData, date: e.target.value})} required />
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Category</label>
          <select style={{ padding: '10px', borderRadius: '6px', border: '1px solid #E5E7EB', outline: 'none', backgroundColor: '#FFF' }} value={formData.category} onChange={(e: any) => setFormData({...formData, category: e.target.value})} required>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Media (Image/Video)</label>
        <input type="file" accept="image/*,video/*" onChange={handleFileChange} style={{ padding: '10px', border: '1px dashed #E5E7EB', borderRadius: '6px' }} />
        {preview && <img src={preview} alt="Preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />}
      </div>
      <div className="flex justify-end mt-4">
        <Button type="submit">Publish</Button>
      </div>
    </form>
  );
};`,

  'src/pages/News/NewsPage.tsx': `import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchFeed, deleteNews } from '@/store/slices/newsSlice';
import { CreateNewsForm } from './components/CreateNewsForm';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';

const NewsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading } = useSelector((state: RootState) => state.news);

  useEffect(() => {
    dispatch(fetchFeed({}));
  }, [dispatch]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this news item?')) {
      dispatch(deleteNews(id)).then(() => dispatch(fetchFeed({})));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <CreateNewsForm />
      
      <div className="bg-white p-6 rounded shadow flex flex-col gap-4">
        <h2 className="text-lg font-bold">Published News</h2>
        {loading ? <div>Loading...</div> : (
          <Table>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 500, color: '#6B7280', fontSize: '12px', textTransform: 'uppercase' }}>Title</th>
                <th style={{ padding: '12px 16px', fontWeight: 500, color: '#6B7280', fontSize: '12px', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '12px 16px', fontWeight: 500, color: '#6B7280', fontSize: '12px', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 500, color: '#6B7280', fontSize: '12px', textTransform: 'uppercase' }}>Views</th>
                <th style={{ padding: '12px 16px', fontWeight: 500, color: '#6B7280', fontSize: '12px', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 6, backgroundColor: '#E5E7EB', overflow: 'hidden' }}>
                        {item.media[0]?.url && <img src={item.media[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div style={{ fontWeight: 500, color: '#111827', fontSize: '14px' }}>{item.title}</div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{item.category}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6B7280' }}>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{item.views}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button onClick={() => handleDelete(item._id)} style={{ color: '#EF4444', padding: '8px', borderRadius: '4px' }}><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
};
export default NewsPage;`
};

Object.entries(files).forEach(([filepath, content]) => {
  const fullPath = path.join(root, filepath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content);
});

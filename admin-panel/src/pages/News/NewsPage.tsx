import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { CreateNewsForm } from './components/CreateNewsForm';
import { NewsDetailModal } from './components/NewsDetailModal';
import * as newsApi from '@/api/newsApi';
import { Archive, FileText, Eye, RotateCcw, Search, Trash2 } from 'lucide-react';
import { safeFormat } from '@/utils/date';
import type { NewsItem } from '@/types';

const NewsPage: React.FC = () => {
  const [view, setView] = useState<'active' | 'archived'>('active');
  const [items, setItems] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await newsApi.getAdminNews({ page, limit, view, search: search.trim() || undefined });
      setItems(response.data.news || []);
      setTotal(response.data.total || 0);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load news.');
      setItems([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [page, limit, view]);
  useEffect(() => {
    const timer = window.setTimeout(() => { if (page !== 1) setPage(1); else void load(); }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const handleArchiveQuick = async (id: string) => {
    if (!window.confirm('Archive this story? It will disappear from the active list but remain recoverable in Archived.')) return;
    try { await newsApi.archiveAdminNews(id); await load(); } catch (err: any) { setError(err?.response?.data?.message || 'Failed to archive news.'); }
  };

  const handleRestoreQuick = async (id: string) => {
    try { await newsApi.restoreAdminNews(id); await load(); } catch (err: any) { setError(err?.response?.data?.message || 'Failed to restore news.'); }
  };

  const handlePermanentDelete = async (id: string) => {
    const item = items.find(news => news._id === id);
    if (!window.confirm(`Permanently delete “${item?.title || 'this story'}”? This removes database records and Cloudinary media and cannot be undone.`)) return;
    try { await newsApi.permanentlyDeleteAdminNews(id); await load(); } catch (err: any) { setError(err?.response?.data?.message || 'Permanent deletion failed.'); }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex flex-col gap-6">
      <CreateNewsForm />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">News Library</h2>
          <p className="text-sm text-muted mt-1">Manage active stories, archived content, media and editorial notes from one place.</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
          <button type="button" onClick={() => { setView('active'); setPage(1); }} className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${view === 'active' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}><FileText size={15} />Active <span className="text-xs text-muted">{view === 'active' ? total : ''}</span></button>
          <button type="button" onClick={() => { setView('archived'); setPage(1); }} className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${view === 'archived' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}><Archive size={15} />Archived <span className="text-xs text-muted">{view === 'archived' ? total : ''}</span></button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div><h3 className="font-semibold text-gray-900">{view === 'active' ? 'Active News' : 'Archived News'}</h3><p className="text-xs text-muted mt-0.5">{total} matching record{total === 1 ? '' : 's'}</p></div>
          <div className="w-full sm:w-80"><Input icon={<Search size={16} />} placeholder="Search title, location or author…" value={search} onChange={e => setSearch(e.target.value)} /></div>
        </div>

        {error && <div className="mx-5 mt-5 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
        {loading ? <div className="py-20"><LoadingSpinner size="lg" /></div> : items.length === 0 ? (
          <EmptyState icon={view === 'archived' ? <Archive size={40} /> : <FileText size={40} />} title={view === 'archived' ? 'No archived news' : 'No active news'} description={view === 'archived' ? 'Archived stories will appear here and can be restored or permanently deleted.' : 'Publish your first official story above.'} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead className="bg-gray-50 border-y border-gray-100"><tr>{['Story', 'Author', 'Category', 'Status', 'Date', 'Engagement', 'Actions'].map(header => <th key={header} className="px-5 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">{header}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map(item => (
                    <tr key={item._id} onClick={() => setSelectedId(item._id)} className="hover:bg-gray-50 cursor-pointer transition-colors">
                      <td className="px-5 py-4 max-w-[340px]"><div className="flex items-center gap-3"><div className="w-12 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">{item.media?.[0] ? (item.media[0].type === 'video' ? <img src={item.media[0].thumbnailUrl || item.media[0].url} alt="" className="w-full h-full object-cover" /> : <img src={item.media[0].url} alt="" className="w-full h-full object-cover" />) : null}</div><div className="min-w-0"><p className="text-sm font-semibold text-gray-900 line-clamp-2">{item.title}</p><p className="text-xs text-muted mt-1 truncate">📍 {item.location}</p></div></div></td>
                      <td className="px-5 py-4"><div className="flex items-center gap-2"><span className="text-sm font-medium text-gray-800">{item.submittedBy?.name || 'Official Admin'}</span>{item.createdByAdmin && <Badge status="admin" label="Admin" />}</div></td>
                      <td className="px-5 py-4"><span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">{item.category}</span></td>
                      <td className="px-5 py-4"><Badge status={item.status} /></td>
                      <td className="px-5 py-4 text-sm text-muted whitespace-nowrap">{safeFormat(item.createdAt, 'MMM d, yyyy')}</td>
                      <td className="px-5 py-4"><div className="flex items-center gap-2 text-xs text-muted"><span><Eye size={13} className="inline mr-1" />{item.views || 0}</span><span>♥ {item.likesCount || 0}</span><span>💬 {item.commentsCount || 0}</span></div></td>
                      <td className="px-5 py-4" onClick={e => e.stopPropagation()}><div className="flex justify-end gap-1">
                        {view === 'active' ? <button type="button" onClick={() => void handleArchiveQuick(item._id)} className="p-2 rounded-lg hover:bg-amber-50 text-gray-500 hover:text-amber-700" title="Archive"><Archive size={16} /></button> : <button type="button" onClick={() => void handleRestoreQuick(item._id)} className="p-2 rounded-lg hover:bg-green-50 text-gray-500 hover:text-green-700" title="Restore"><RotateCcw size={16} /></button>}
                        {view === 'archived' && <button type="button" onClick={() => void handlePermanentDelete(item._id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600" title="Permanently delete"><Trash2 size={16} /></button>}
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-4 border-t border-gray-100"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
          </>
        )}
      </div>

      {selectedId && <NewsDetailModal newsId={selectedId} onClose={() => setSelectedId(null)} onChanged={() => void load()} />}
    </div>
  );
};

export default NewsPage;

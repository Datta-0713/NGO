import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { fetchFeed, deleteNews } from '@/store/slices/newsSlice';
import { CreateNewsForm } from './components/CreateNewsForm';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { Trash2, FileText, Eye } from 'lucide-react';
import { safeFormat } from '@/utils/date';
import { usePagination } from '@/hooks/usePagination';
import { SubmissionDetailModal } from '../Submissions/components/SubmissionDetailModal';
import type { NewsItem } from '@/types';

const NewsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, total, loading } = useSelector((state: RootState) => state.news);
  const { page, limit, goToPage } = usePagination({ initialLimit: 20 });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);

  useEffect(() => {
    dispatch(fetchFeed({ page, limit }));
  }, [dispatch, page, limit]);

  const totalPages = Math.ceil((total || items.length) / limit);

  const handleDelete = () => {
    if (!deleteId) return;
    dispatch(deleteNews(deleteId)).then(() => {
      dispatch(fetchFeed({ page, limit }));
      setDeleteId(null);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Create form */}
      <CreateNewsForm />

      {/* Published news table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Published News</h2>
          <span className="text-sm text-muted">{items.length} stories</span>
        </div>

        {loading ? (
          <div className="py-16"><LoadingSpinner size="lg" /></div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<FileText size={40} />}
            title="No published news yet"
            description="Create your first news story above."
          />
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Story', 'Category', 'Status', 'Date', 'Views', ''].map(h => (
                    <th
                      key={h}
                      className={`px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide ${
                        h === '' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(item => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                          {item.media?.[0]?.url && (
                            <img
                              src={item.media[0].url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.title}</p>
                          <p className="text-xs text-muted truncate">📍 {item.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-5 py-3"><Badge status={item.status} /></td>
                    <td className="px-5 py-3 text-sm text-muted whitespace-nowrap">
                      {safeFormat(item.createdAt, 'MMM d, yyyy')}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Eye size={14} className="text-muted" />
                        {item.views?.toLocaleString() ?? 0}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(item._id);
                        }}
                        className="p-2 rounded-lg hover:bg-red-50 text-muted hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-gray-100">
              <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
            </div>
          </>
        )}
      </div>

      {/* Detail/Comments Modal */}
      {selectedItem && (
        <SubmissionDetailModal
          submission={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Delete confirmation */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete News"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" icon={<Trash2 size={15} />} onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to permanently delete this news story?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default NewsPage;

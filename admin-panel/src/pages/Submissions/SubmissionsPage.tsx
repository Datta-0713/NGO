import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { fetchSubmissions, selectSubmission } from '@/store/slices/submissionsSlice';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { SubmissionCard } from './components/SubmissionCard';
import { SubmissionDetailModal } from './components/SubmissionDetailModal';
import { CheckSquare, Search } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';

const STATUS_TABS = [
  { label: 'All',       value: '' },
  { label: 'Pending',   value: 'pending' },
  { label: 'Published', value: 'published' },
  { label: 'Rejected',  value: 'rejected' },
];

const SubmissionsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, total, loading, selectedSubmission } = useSelector((state: RootState) => state.submissions);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const { page, limit, goToPage } = usePagination({ initialLimit: 15 });

  useEffect(() => {
    dispatch(fetchSubmissions({ page, limit, status: statusFilter || undefined, search: debouncedSearch || undefined }));
  }, [dispatch, page, limit, statusFilter, debouncedSearch]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col gap-5">
      {/* Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 shadow-sm p-1">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); goToPage(1); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === tab.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="w-72">
          <Input
            placeholder="Search submissions..."
            icon={<Search size={16} />}
            value={search}
            onChange={(e) => { setSearch(e.target.value); goToPage(1); }}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20"><LoadingSpinner size="lg" /></div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={40} />}
          title="No submissions found"
          description="Try changing the filter or search terms."
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {items.map(item => (
              <SubmissionCard
                key={item._id}
                item={item}
                onView={() => dispatch(selectSubmission(item))}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
        </>
      )}

      {/* Detail Modal */}
      {selectedSubmission && (
        <SubmissionDetailModal
          submission={selectedSubmission}
          onClose={() => dispatch(selectSubmission(null))}
        />
      )}
    </div>
  );
};

export default SubmissionsPage;
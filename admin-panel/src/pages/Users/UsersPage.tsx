import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchUsers } from '@/store/slices/usersSlice';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { UserDetailModal } from './components/UserDetailModal';
import { Users, Search } from 'lucide-react';
import { safeFormat } from '@/utils/date';
import type { User } from '@/types';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';

const UsersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: users, total, loading } = useSelector((state: RootState) => state.users);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { page, limit, goToPage } = usePagination({ initialLimit: 20 });

  useEffect(() => {
    dispatch(fetchUsers({ page, limit, search: debouncedSearch || undefined }));
  }, [dispatch, page, limit, debouncedSearch]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Contributors ({total})</h2>
        <div className="w-72">
          <Input
            placeholder="Search by name or email..."
            icon={<Search size={16} />}
            value={search}
            onChange={(e) => { setSearch(e.target.value); goToPage(1); }}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16"><LoadingSpinner size="lg" /></div>
        ) : users.length === 0 ? (
          <EmptyState icon={<Users size={40} />} title="No contributors found" description="Try a different search." />
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Contributor', 'Location', 'Stories', 'Likes', 'Credits', 'Joined'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    onClick={() => setSelectedUser(user)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.profilePhoto} name={user.name} size={36} />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">{user.location || '—'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">{user.storiesCount}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{user.likesReceived}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 bg-primary-xlight text-primary text-xs font-semibold rounded-full">
                        {user.credits} pts
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">{safeFormat(user.createdAt, 'MMM d, yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-100">
              <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
            </div>
          </>
        )}
      </div>

      {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
};

export default UsersPage;

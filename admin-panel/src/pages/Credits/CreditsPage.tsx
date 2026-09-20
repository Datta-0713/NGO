import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp, Plus, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { creditsApi } from '@/api/creditsApi';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Pagination } from '@/components/ui/Pagination';
import { safeFormat } from '@/utils/date';
import { usePagination } from '@/hooks/usePagination';

const CreditsPage: React.FC = () => {
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ userId: '', amount: '', reason: '', action: 'credit' as 'credit' | 'debit' });
  const [adjusting, setAdjusting] = useState(false);
  const [adjustSuccess, setAdjustSuccess] = useState(false);
  const [adjustError, setAdjustError] = useState('');

  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalAwarded: 0, totalDeducted: 0 });
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const { page, limit, goToPage } = usePagination({ initialLimit: 15 });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await creditsApi.getAllTransactions(page, limit);
      setTransactions(data.transactions || []);
      setTotal(data.total || 0);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, limit]);
  const handleAdjust = async () => {
    if (!adjustForm.userId || !adjustForm.amount || !adjustForm.reason) {
      setAdjustError('All fields are required.');
      return;
    }
    setAdjusting(true);
    setAdjustError('');
    try {
      await creditsApi.adjustCredits(adjustForm.userId, Number(adjustForm.amount), adjustForm.reason, adjustForm.action);
      setAdjustSuccess(true);
      setAdjustForm({ userId: '', amount: '', reason: '', action: 'credit' });
      fetchTransactions();
      setTimeout(() => { setAdjustModalOpen(false); setAdjustSuccess(false); }, 1500);
    } catch (e: any) {
      setAdjustError(e?.response?.data?.message || 'Failed to adjust credits. Check the User ID is correct.');
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Credits Ledger</h2>
        <Button icon={<Plus size={16} />} onClick={() => setAdjustModalOpen(true)}>Adjust Credits</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: TrendingUp, label: 'Total Awarded', value: stats.totalAwarded.toString(), color: 'text-green-600 bg-green-50' },
          { icon: TrendingDown, label: 'Total Deducted', value: stats.totalDeducted.toString(), color: 'text-red-600 bg-red-50' },
          { icon: Coins, label: 'Net Circulation', value: (stats.totalAwarded - stats.totalDeducted).toString(), color: 'text-primary bg-primary-xlight' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color}`}><Icon size={22} /></div>
            <div>
              <p className="text-sm text-muted">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        {loading ? (
          <div className="py-20"><LoadingSpinner size="lg" /></div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Coins size={40} className="text-gray-200 mb-4" />
            <p className="text-muted">No transactions found</p>
            <p className="text-sm text-muted mt-1">Credits are automatically logged when stories are approved</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Date', 'User', 'Type', 'Amount', 'Reason'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map((tx: any) => (
                    <tr key={tx._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-muted whitespace-nowrap">
                        {safeFormat(tx.createdAt, 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4">
                        {tx.user ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{tx.user.name}</span>
                            <span className="text-xs text-muted">{tx.user.email}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted">Unknown User</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          tx.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                        {tx.reason} {tx.relatedNews ? `(News: ${tx.relatedNews.title})` : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <Pagination page={page} totalPages={Math.ceil(total / limit)} onPageChange={goToPage} />
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title="Adjust User Credits"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAdjustModalOpen(false)}>Cancel</Button>
            <Button loading={adjusting} onClick={handleAdjust} disabled={adjustSuccess}>
              {adjustSuccess ? '✓ Done' : 'Adjust Credits'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {adjustSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium text-center">
              ✓ Credits adjusted successfully!
            </div>
          )}
          {adjustError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {adjustError}
            </div>
          )}
          <Input label="User ID" placeholder="MongoDB ObjectId of user" value={adjustForm.userId} onChange={e => setAdjustForm(f => ({...f, userId: e.target.value}))} />
          <div className="flex gap-2">
            <button type="button" onClick={() => setAdjustForm(f => ({...f, action: 'credit'}))} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${adjustForm.action === 'credit' ? 'border-primary bg-primary-xlight text-primary' : 'border-gray-200 text-gray-500'}`}>Credit</button>
            <button type="button" onClick={() => setAdjustForm(f => ({...f, action: 'debit'}))} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${adjustForm.action === 'debit' ? 'border-red-300 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500'}`}>Debit</button>
          </div>
          <Input label="Amount" type="number" placeholder="e.g. 10" value={adjustForm.amount} onChange={e => setAdjustForm(f => ({...f, amount: e.target.value}))} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Reason</label>
            <textarea
              rows={3}
              placeholder="e.g. Bonus for exceptional community engagement"
              value={adjustForm.reason}
              onChange={e => setAdjustForm(f => ({...f, reason: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreditsPage;
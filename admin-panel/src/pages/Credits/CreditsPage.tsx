import React, { useState } from 'react';
import { Coins, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { creditsApi } from '@/api/creditsApi';


const CreditsPage: React.FC = () => {
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ userId: '', amount: '', reason: '' });
  const [adjusting, setAdjusting] = useState(false);
  const [adjustSuccess, setAdjustSuccess] = useState(false);
  const [adjustError, setAdjustError] = useState('');


  const handleAdjust = async () => {
    if (!adjustForm.userId || !adjustForm.amount || !adjustForm.reason) {
      setAdjustError('All fields are required.');
      return;
    }
    setAdjusting(true);
    setAdjustError('');
    try {
      await creditsApi.adjustCredits(adjustForm.userId, Number(adjustForm.amount), adjustForm.reason);
      setAdjustSuccess(true);
      setAdjustForm({ userId: '', amount: '', reason: '' });
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

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Coins, label: 'Total Awarded', value: '—', color: 'text-primary bg-primary-xlight' },
          { icon: TrendingUp, label: 'This Month', value: '—', color: 'text-green-600 bg-green-50' },
          { icon: Coins, label: 'Pending Approval', value: '—', color: 'text-yellow-600 bg-yellow-50' },
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

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Coins size={40} className="text-gray-200 mb-4" />
          <p className="text-muted">Transaction history will appear here</p>
          <p className="text-sm text-muted mt-1">Credits are automatically logged when stories are approved</p>
        </div>
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
          <Input label="Amount" type="number" placeholder="e.g. 10 or -5" value={adjustForm.amount} onChange={e => setAdjustForm(f => ({...f, amount: e.target.value}))} />
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
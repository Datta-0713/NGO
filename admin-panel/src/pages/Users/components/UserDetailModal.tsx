import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MapPin, Mail, BookOpen, Heart, Coins, Calendar, Plus } from 'lucide-react';
import { safeFormat } from '@/utils/date';
import { creditsApi } from '@/api/creditsApi';
import type { User } from '@/types';

interface UserDetailModalProps {
  user: User;
  onClose: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [form, setForm] = useState({ amount: '', reason: '', action: 'credit' as 'credit' | 'debit' });
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState('');
  const [adjustSuccess, setAdjustSuccess] = useState(false);
  const [currentCredits, setCurrentCredits] = useState(user.credits);

  const handleAdjust = async () => {
    if (!form.amount || !form.reason) {
      setAdjustError('Amount and reason are required.');
      return;
    }
    setAdjusting(true);
    setAdjustError('');
    try {
      const result = await creditsApi.adjustCredits(user._id, Number(form.amount), form.reason, form.action);
      setCurrentCredits(result?.data?.user?.credits ?? currentCredits + (form.action === 'credit' ? Math.abs(Number(form.amount)) : -Math.abs(Number(form.amount))));
      setAdjustSuccess(true);
      setForm({ amount: '', reason: '', action: 'credit' });
      setTimeout(() => { setAdjustOpen(false); setAdjustSuccess(false); }, 1500);
    } catch (e: any) {
      setAdjustError(e?.response?.data?.message || 'Failed to adjust credits.');
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Contributor Profile" size="md">
      <div className="flex flex-col items-center gap-4 pb-6 border-b border-gray-100 mb-6">
        <Avatar src={user.profilePhoto} name={user.name} size={72} />
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
          <p className="text-sm text-muted">{user.role}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {user.bio && <p className="text-sm text-gray-600 italic">"{user.bio}"</p>}

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Mail, label: 'Email', value: user.email },
            { icon: MapPin, label: 'Location', value: user.location || 'Not specified' },
            { icon: Calendar, label: 'Joined', value: safeFormat(user.createdAt, 'MMM d, yyyy') },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-lg">
              <Icon size={16} className="text-muted mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted">{label}</p>
                <p className="text-sm font-medium text-gray-900">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mt-2">
          {[
            { icon: BookOpen, label: 'Stories', value: user.storiesCount, color: 'text-primary bg-primary-xlight' },
            { icon: Heart, label: 'Likes', value: user.likesReceived, color: 'text-red-500 bg-red-50' },
            { icon: Coins, label: 'Credits', value: currentCredits, color: 'text-yellow-600 bg-yellow-50' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
              <div className={`p-2 rounded-lg ${color} mb-2`}><Icon size={18} /></div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-muted">{label}</p>
            </div>
          ))}
        </div>

        {/* Adjust Credits — inline, no raw ObjectId needed */}
        <div className="border-t border-gray-100 pt-4 mt-2">
          {!adjustOpen ? (
            <Button
              variant="secondary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => setAdjustOpen(true)}
              className="w-full"
            >
              Adjust Credits
            </Button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-gray-800">Adjust Credits for {user.name}</p>
              {adjustSuccess && (
                <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 text-center">
                  ✓ Credits adjusted successfully!
                </div>
              )}
              {adjustError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {adjustError}
                </div>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={() => setForm(f => ({...f, action: 'credit'}))} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${form.action === 'credit' ? 'border-primary bg-primary-xlight text-primary' : 'border-gray-200 text-gray-500'}`}>Credit</button>
                <button type="button" onClick={() => setForm(f => ({...f, action: 'debit'}))} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${form.action === 'debit' ? 'border-red-300 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500'}`}>Debit</button>
              </div>
              <Input
                label="Amount"
                type="number"
                placeholder="e.g. 10"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Reason</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Bonus for exceptional community engagement"
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => { setAdjustOpen(false); setAdjustError(''); }} className="flex-1">Cancel</Button>
                <Button size="sm" loading={adjusting} onClick={handleAdjust} disabled={adjustSuccess} className="flex-1">
                  {adjustSuccess ? '✓ Done' : 'Confirm'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
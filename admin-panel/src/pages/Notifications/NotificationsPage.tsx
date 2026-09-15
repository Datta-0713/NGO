import React, { useState } from 'react';
import { Bell, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { notificationsApi } from '@/api/notificationsApi';

const NotificationsPage: React.FC = () => {
  const [form, setForm] = useState({ title: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleBroadcast = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      setError('Both title and message are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await notificationsApi.broadcastNotification(form.title, form.message);
      setSuccess(true);
      setForm({ title: '', message: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900">Broadcast Notification</h2>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="bg-primary-xlight p-2.5 rounded-lg"><Bell size={20} className="text-primary" /></div>
          <div>
            <p className="font-semibold text-gray-900">Send to All Users</p>
            <p className="text-sm text-muted">This notification will appear in every user's Updates feed.</p>
          </div>
        </div>

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
            ✓ Notification sent successfully to all active users!
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <Input
          label="Notification Title *"
          placeholder="e.g. Community cleanup this weekend"
          value={form.title}
          onChange={e => setForm(f => ({...f, title: e.target.value}))}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Message *</label>
          <textarea
            rows={4}
            placeholder="Write a clear, helpful message for your community..."
            value={form.message}
            onChange={e => setForm(f => ({...f, message: e.target.value}))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <div className="flex justify-end">
          <Button icon={<Send size={16} />} loading={loading} onClick={handleBroadcast}>
            Send Notification
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
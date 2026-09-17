import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, Leaf } from 'lucide-react';
import { settingsApi } from '@/api/settingsApi';

const CATEGORIES = ['Community', 'Education', 'Environment', 'Health', 'Events'];

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({ ngoName: '', tagline: '', creditPerApproval: '10', welcomeBonus: '5' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    settingsApi.get().then(data => setSettings({
      ngoName: data.ngoName, tagline: data.tagline,
      creditPerApproval: String(data.creditPerApproval), welcomeBonus: String(data.welcomeBonus),
    })).catch((e:any) => setError(e?.response?.data?.message || 'Failed to load settings')).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setMessage(''); setError('');
    try {
      await settingsApi.update({
        ngoName: settings.ngoName.trim(), tagline: settings.tagline.trim(),
        creditPerApproval: Number(settings.creditPerApproval), welcomeBonus: Number(settings.welcomeBonus),
      });
      setMessage('Settings saved successfully.');
    } catch (e:any) {
      setError(e?.response?.data?.message || 'Could not save settings');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="py-20 text-center text-sm text-muted">Loading settings…</div>;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div><h2 className="text-xl font-bold text-gray-900">Platform Settings</h2><p className="text-sm text-muted mt-1">Changes are stored on the server and audited.</p></div>
      {message && <div className="p-3 rounded-xl border border-green-200 bg-green-50 text-sm text-green-700">{message}</div>}
      {error && <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">{error}</div>}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100"><div className="bg-primary-xlight p-2.5 rounded-lg"><Leaf size={20} className="text-primary" /></div><p className="font-semibold text-gray-900">NGO Branding</p></div>
        <Input label="NGO Name" value={settings.ngoName} onChange={e => setSettings(s => ({...s, ngoName: e.target.value}))} maxLength={120} />
        <Input label="Tagline" value={settings.tagline} onChange={e => setSettings(s => ({...s, tagline: e.target.value}))} maxLength={240} />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
        <p className="font-semibold text-gray-900 pb-4 border-b border-gray-100">Credits Configuration</p>
        <Input label="Credits per Approved Story" type="number" min={1} max={10000} value={settings.creditPerApproval} onChange={e => setSettings(s => ({...s, creditPerApproval: e.target.value}))} />
        <Input label="Welcome Bonus Credits" type="number" min={0} max={10000} value={settings.welcomeBonus} onChange={e => setSettings(s => ({...s, welcomeBonus: e.target.value}))} />
        <p className="text-xs text-muted">New values apply to future awards only. Existing credit balances are unchanged.</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
        <p className="font-semibold text-gray-900 pb-4 border-b border-gray-100">News Categories</p>
        <div className="flex flex-wrap gap-2">{CATEGORIES.map(cat => <span key={cat} className="px-3 py-1.5 bg-primary-xlight text-primary text-sm font-medium rounded-full">{cat}</span>)}</div>
        <p className="text-xs text-muted">Categories are intentionally fixed in the API so mobile and admin cannot drift out of sync.</p>
      </div>
      <div className="flex justify-end"><Button icon={<Save size={16} />} onClick={handleSave} loading={saving} disabled={saving}>Save Settings</Button></div>
    </div>
  );
};

export default SettingsPage;
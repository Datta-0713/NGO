import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, Leaf } from 'lucide-react';

const CATEGORIES = ['Community', 'Education', 'Environment', 'Health', 'Events'];

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    ngoName: 'Asian News Bureau',
    tagline: 'Building stronger communities together',
    creditPerApproval: '10',
    welcomeBonus: '5',
  });

  const handleSave = () => {
    // Disabled as per audit requirements
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900">Platform Settings</h2>

      {/* Branding */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="bg-primary-xlight p-2.5 rounded-lg"><Leaf size={20} className="text-primary" /></div>
          <p className="font-semibold text-gray-900">NGO Branding</p>
        </div>
        <Input label="NGO Name" value={settings.ngoName} onChange={e => setSettings(s => ({...s, ngoName: e.target.value}))} />
        <Input label="Tagline" value={settings.tagline} onChange={e => setSettings(s => ({...s, tagline: e.target.value}))} />
      </div>

      {/* Credits */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
        <p className="font-semibold text-gray-900 pb-4 border-b border-gray-100">Credits Configuration</p>
        <Input label="Credits per Approved Story" type="number" value={settings.creditPerApproval} onChange={e => setSettings(s => ({...s, creditPerApproval: e.target.value}))} />
        <Input label="Welcome Bonus Credits" type="number" value={settings.welcomeBonus} onChange={e => setSettings(s => ({...s, welcomeBonus: e.target.value}))} />
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
        <p className="font-semibold text-gray-900 pb-4 border-b border-gray-100">News Categories</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <span key={cat} className="px-3 py-1.5 bg-primary-xlight text-primary text-sm font-medium rounded-full">{cat}</span>
          ))}
        </div>
        <p className="text-xs text-muted">Categories are configured in the server environment. Contact your developer to add or remove categories.</p>
      </div>

      <div className="flex justify-end items-center gap-4">
        <p className="text-sm text-yellow-600 font-medium">Settings API coming soon</p>
        <Button icon={<Save size={16} />} onClick={handleSave} disabled>
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
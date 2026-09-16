import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CATEGORIES } from '@/constants';
import { useDispatch, useSelector } from 'react-redux';
import { createNews, fetchFeed } from '@/store/slices/newsSlice';
import type { AppDispatch, RootState } from '@/store';
import { Upload, X, Plus, AlertCircle, CheckCircle } from 'lucide-react';

export const CreateNewsForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { error: storeError } = useSelector((state: RootState) => state.news);

  const [formData, setFormData] = useState({
    title: '', description: '', location: '', date: '', category: CATEGORIES[0] as string,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [localError, setLocalError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles].slice(0, 5));
      const newPreviews = newFiles.map(f => URL.createObjectURL(f));
      setPreviews(prev => [...prev, ...newPreviews].slice(0, 5));
    }
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', location: '', date: '', category: CATEGORIES[0] as string });
    setFiles([]);
    setPreviews([]);
    setLocalError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMsg('');

    if (!formData.title || !formData.description || !formData.location || !formData.date) {
      setLocalError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    files.forEach(f => data.append('media', f));

    const result = await dispatch(createNews(data));

    setSubmitting(false);

    if (createNews.fulfilled.match(result)) {
      setSuccessMsg('News published successfully!');
      resetForm();
      // Refresh the feed list
      dispatch(fetchFeed({}));
      // Auto-collapse after 2 seconds
      setTimeout(() => {
        setExpanded(false);
        setSuccessMsg('');
      }, 2000);
    } else {
      // Keep the form open with error
      setLocalError((result.payload as string) || storeError || 'Failed to publish news. Please try again.');
    }
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full bg-white rounded-xl border-2 border-dashed border-gray-200 p-6 flex items-center justify-center gap-3 text-muted hover:border-primary hover:text-primary transition-colors"
      >
        <Plus size={20} />
        <span className="text-sm font-medium">Publish Official News</span>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Publish Official News</h2>
        <button
          type="button"
          onClick={() => { setExpanded(false); resetForm(); }}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-muted transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Error message */}
      {localError && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{localError}</span>
        </div>
      )}

      {/* Success message */}
      {successMsg && (
        <div className="flex items-start gap-2.5 p-3.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <Input
        label="Title *"
        placeholder="Enter a compelling headline"
        value={formData.title}
        onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
        required
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Description *</label>
        <textarea
          rows={4}
          placeholder="Write the full news story..."
          value={formData.description}
          onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Location *"
          placeholder="City, State"
          value={formData.location}
          onChange={e => setFormData(f => ({ ...f, location: e.target.value }))}
          required
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Date *</label>
          <input
            type="date"
            value={formData.date}
            onChange={e => setFormData(f => ({ ...f, date: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Category *</label>
          <select
            value={formData.category}
            onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Media upload */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Media (up to 5 files)</label>
        <div className="flex gap-3 flex-wrap">
          {previews.map((p, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 group">
              <img src={p} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
          ))}
          {previews.length < 5 && (
            <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-primary hover:text-primary text-muted transition-colors">
              <Upload size={18} />
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                multiple
              />
            </label>
          )}
        </div>
        <p className="text-xs text-muted">Supported: JPG, PNG, GIF, MP4, MOV (max 50MB each)</p>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={() => { setExpanded(false); resetForm(); }}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Publish News
        </Button>
      </div>
    </form>
  );
};
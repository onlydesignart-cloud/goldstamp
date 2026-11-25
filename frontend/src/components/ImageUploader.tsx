'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, X, Loader2, Link2, Sparkles, Check } from 'lucide-react';

interface ImageUploaderProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  folder?: 'businesses' | 'campaigns' | 'rewards' | 'avatars' | 'general';
  aspectRatio?: 'square' | 'video' | 'banner';
  hint?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  value,
  onChange,
  folder = 'general',
  aspectRatio = 'video',
  hint,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square max-w-[200px]'
      : aspectRatio === 'banner'
      ? 'aspect-[3/1] w-full'
      : 'aspect-[16/9] w-full';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processUpload(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processUpload(file);
  };

  const processUpload = async (file: File) => {
    setError(null);

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (json.success && json.data?.url) {
        onChange(json.data.url);
      } else {
        setError(json.error?.message || 'Failed to upload image.');
      }
    } catch (err: any) {
      setError(err.message || 'Upload connection error.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setError('Please paste a valid image URL.');
      return;
    }
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setError('Image URL must start with https:// or http://');
      return;
    }
    onChange(trimmed);
    setUrlInput('');
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {label && (
          <label className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
        )}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 rounded-md transition ${
              mode === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 rounded-md transition ${
              mode === 'url' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Paste URL
          </button>
        </div>
      </div>

      {value ? (
        <div className={`relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group ${aspectClass}`}>
          <img
            src={value}
            alt={label || 'Uploaded preview'}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (mode === 'upload') {
                  fileInputRef.current?.click();
                } else {
                  setUrlInput(value);
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-white/90 text-slate-900 text-xs font-bold shadow hover:bg-white transition"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-lg bg-rose-600 text-white shadow hover:bg-rose-700 transition"
              title="Remove Image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : mode === 'url' ? (
        <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                placeholder="https://res.cloudinary.com/... or image link"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 focus:border-emerald-600 rounded-xl text-xs text-slate-900 outline-none transition"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Paste your Cloudinary CDN URL directly to save bandwidth.</span>
          </p>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/20 transition-all flex flex-col items-center justify-center p-6 text-center ${aspectClass}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
              <span className="text-xs font-medium text-slate-600">Uploading to Cloudinary CDN...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                <UploadCloud className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Click to upload or drag & drop
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  PNG, JPG, or WEBP (Max 10MB) • Stored on Cloudinary
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {hint && !error && (
        <p className="text-[11px] text-slate-400">{hint}</p>
      )}

      {error && (
        <p className="text-[11px] font-semibold text-rose-600">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

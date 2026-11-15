'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { Layers, Plus, CheckCircle2, XCircle, Store, Coffee, Trophy, Dumbbell } from 'lucide-react';

export default function AdminIndustriesPage() {
  const [industries, setIndustries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('Store');
  const [saving, setSaving] = useState(false);

  const loadIndustries = async () => {
    setLoading(true);
    try {
      const res = await api.getIndustries(true);
      if (res.success && res.data) {
        setIndustries(res.data);
      }
    } catch (err) {
      console.error('Failed to load industries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIndustries();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.createIndustry({
        name,
        slug: slug.toLowerCase() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        icon,
      });
      if (res.success) {
        setShowAdd(false);
        setName('');
        setSlug('');
        await loadIndustries();
      }
    } catch (err) {
      console.error('Failed to create industry:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.toggleIndustry(id);
      await loadIndustries();
    } catch (err) {
      console.error('Failed to toggle industry status:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Dynamic Industry Categories</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure business industries, icons, and activation toggles dynamically without hardcoding.
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Industry</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {industries.map((ind) => (
          <div
            key={ind.id}
            className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-start justify-between shadow-sm"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">{ind.name}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ind.isActive ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/15 text-red-300 border border-red-500/30'
                  }`}
                >
                  {ind.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-1">slug: {ind.slug}</div>
              <div className="text-xs text-purple-300 mt-3 font-semibold">
                {ind.businessCount || 0} Businesses Enrolled
              </div>
            </div>

            <button
              onClick={() => handleToggle(ind.id)}
              className="text-xs text-slate-400 hover:text-white underline transition"
            >
              {ind.isActive ? 'Disable' : 'Enable'}
            </button>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-lg">Add Industry Category</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Industry Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }}
                  placeholder="e.g. Laser Tag & Arcade"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Slug</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition"
                >
                  {saving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

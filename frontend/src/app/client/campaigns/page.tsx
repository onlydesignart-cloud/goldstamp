'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import { ImageUploader } from '../../../components/ImageUploader';
import {
  Megaphone,
  Plus,
  Gift,
  CheckCircle2,
  Clock,
  Eye,
  BarChart3,
  Users,
  ArrowRight,
  Image as ImageIcon,
  Edit3,
  X,
  Sparkles,
} from 'lucide-react';

export default function ClientCampaignsPage() {
  const { business } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCamp, setEditingCamp] = useState<any | null>(null);
  const [newBannerUrl, setNewBannerUrl] = useState('');
  const [savingBanner, setSavingBanner] = useState(false);

  async function loadCampaigns() {
    let targetBizId = business?.id;
    if (!targetBizId && typeof window !== 'undefined') {
      try {
        const storedBiz = localStorage.getItem('goldstamp_merchant_business');
        if (storedBiz) targetBizId = JSON.parse(storedBiz).id;
      } catch { }
    }
    if (!targetBizId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.getCampaigns(targetBizId);
      if (res.success && res.data) {
        setCampaigns(res.data);
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCampaigns();
  }, [business]);

  const handleSaveBanner = async () => {
    if (!editingCamp) return;
    setSavingBanner(true);
    try {
      const res = await (api as any).updateCampaignBanner(editingCamp.id, newBannerUrl);
      if (res.success) {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === editingCamp.id ? { ...c, bannerImage: newBannerUrl } : c))
        );
        setEditingCamp(null);
        setNewBannerUrl('');
      }
    } catch (err) {
      console.error('Failed to update banner:', err);
    } finally {
      setSavingBanner(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Loyalty Campaigns</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure stamps, visit milestones, and automated reward rules
          </p>
        </div>

        <Link
          href="/client/campaigns/create"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Launch New Campaign</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-200 animate-pulse"></div>
          ))
        ) : campaigns.length > 0 ? (
          campaigns.map((camp) => {
            const rule = camp.rules?.[0];
            const reward = camp.rewards?.[0];

            return (
              <div
                key={camp.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
              >
                {/* Banner Header with Edit Ability */}
                {camp.bannerImage ? (
                  <div className="h-40 w-full overflow-hidden bg-slate-100 relative group">
                    <img
                      src={camp.bannerImage}
                      alt={camp.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCamp(camp);
                          setNewBannerUrl(camp.bannerImage || '');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/95 text-slate-900 font-bold text-xs shadow-md hover:bg-white flex items-center gap-1.5 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Change Cover Banner</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCamp(camp);
                      setNewBannerUrl('');
                    }}
                    className="h-28 w-full bg-slate-50 hover:bg-emerald-50/40 border-b border-dashed border-slate-200 transition flex flex-col items-center justify-center gap-1 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-xs group-hover:border-emerald-400">
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-700">
                      + Add Campaign Cover Banner
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Upload or paste Cloudinary image URL
                    </span>
                  </button>
                )}

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {camp.type} Program
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${camp.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                          }`}
                      >
                        {camp.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{camp.name}</h3>
                    <p className="text-xs text-slate-500 mt-1.5">{camp.description}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Requirement:</span>
                      <span className="font-bold text-slate-800">
                        {rule?.conditionValue || camp.targetStamps || 5} {camp.type.toLowerCase()}s
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Gift className="w-3.5 h-3.5 text-emerald-600" /> Reward:
                      </span>
                      <span className="font-bold text-emerald-700">
                        {camp.rewardTitle || reward?.title || 'Reward'}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <Link
                        href={`/client/campaigns/${camp.id}`}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>View Details & Customers</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <Megaphone className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No campaigns launched yet</h3>
            <p className="text-xs text-slate-500">
              Create your first campaign to reward customers for recurring visits.
            </p>
            <Link
              href="/client/campaigns/create"
              className="inline-flex items-center gap-1.5 bg-emerald-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm"
            >
              <Plus className="w-4 h-4" /> Start Wizard
            </Link>
          </div>
        )}
      </div>

      {/* BANNER EDIT MODAL */}
      {editingCamp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Update Campaign Cover Banner
                </h3>
                <p className="text-xs text-slate-500">
                  {editingCamp.name} • Displays on customer cards and venue details
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCamp(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ImageUploader
              label="Select or Paste Banner Image"
              value={newBannerUrl}
              onChange={setNewBannerUrl}
              folder="campaigns"
              aspectRatio="video"
              hint="Upload PNG/JPG to Cloudinary or paste direct Cloudinary URL"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingCamp(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBanner}
                disabled={savingBanner || !newBannerUrl}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{savingBanner ? 'Saving...' : 'Save Banner to Cloudinary'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

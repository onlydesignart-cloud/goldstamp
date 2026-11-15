'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import { ADMIN_ROUTE_PREFIX } from '../../../../config/adminRoute';
import { ArrowLeft, Building2, User, Gift, Footprints, Shield, Calendar, MapPin } from 'lucide-react';

export default function AdminBusinessDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const res = await api.getAdminBusinessDetail(id);
        if (res.success && res.data) {
          setBusiness(res.data);
        }
      } catch (err) {
        console.error('Failed to load business details:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-xs text-slate-400">Loading business details...</div>;
  }

  if (!business) {
    return <div className="p-8 text-xs text-slate-400">Business not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        href={`${ADMIN_ROUTE_PREFIX}/businesses`}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Businesses
      </Link>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 overflow-hidden flex items-center justify-center font-bold text-xl text-white border border-slate-700">
              {business.logo ? (
                <img src={business.logo} alt={business.name} className="w-full h-full object-cover" />
              ) : (
                business.name.substring(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{business.name}</h1>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                <span>Industry: {business.industry?.name}</span>
                <span>•</span>
                <span>Slug: {business.slug}</span>
                <span>•</span>
                <span className="font-mono text-purple-300">ID: {business.id}</span>
              </div>
            </div>
          </div>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
              business.status === 'ACTIVE'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {business.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs text-slate-400">Total Patrons</div>
            <div className="text-xl font-bold text-white mt-1">
              {business.customerBusinesses?.length || 0}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs text-slate-400">Active Campaigns</div>
            <div className="text-xl font-bold text-purple-400 mt-1">
              {business.campaigns?.length || 0}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs text-slate-400">Total Check-Ins</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {business.visits?.length || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

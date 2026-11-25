'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import { Megaphone, Plus, Gift, CheckCircle2, Clock, Eye, BarChart3, Users, ArrowRight } from 'lucide-react';

export default function ClientCampaignsPage() {
  const { business } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
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
    load();
  }, [business]);

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
                {camp.bannerImage && (
                  <div className="h-36 w-full overflow-hidden bg-slate-100">
                    <img src={camp.bannerImage} alt={camp.name} className="w-full h-full object-cover" />
                  </div>
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
                        {rule?.conditionValue || 10} {camp.type.toLowerCase()}s
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Gift className="w-3.5 h-3.5 text-emerald-600" /> Reward:
                      </span>
                      <span className="font-bold text-emerald-700">
                        {reward?.title || 'Reward'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-400">Total Issued Stamps:</span>
                      <span className="font-mono font-bold text-slate-700">
                        {camp._count?.stampTransactions || 0}
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
    </div>
  );
}

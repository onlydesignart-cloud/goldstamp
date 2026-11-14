'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { Footprints, MapPin, CheckCircle2, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function VisitsPage() {
  const { user } = useAuth();
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.getMyVisits();
        if (res.success && res.data) {
          setVisits(res.data);
        }
      } catch (err) {
        console.error('Failed to load visits:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      load();
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full mb-2">
          <Footprints className="w-3.5 h-3.5" />
          <span>Activity Log</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Verified Visit History
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          A verifiable timeline of all your verified check-ins and stamps.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 space-y-3">
            <div className="h-10 bg-slate-100 rounded-lg animate-pulse"></div>
            <div className="h-10 bg-slate-100 rounded-lg animate-pulse"></div>
          </div>
        ) : visits.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {visits.map((v) => (
              <div key={v.id} className="p-4 sm:p-5 flex items-center justify-between text-sm hover:bg-slate-50/60 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{v.business?.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{v.campaign?.name || 'Verified Check-in'}</span>
                      <span>•</span>
                      <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded font-mono">
                        {v.verificationMethod || 'QR'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <div className="font-semibold text-slate-700">
                    {new Date(v.createdAt).toLocaleDateString()}
                  </div>
                  <div>{new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-500">
            No visits recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}

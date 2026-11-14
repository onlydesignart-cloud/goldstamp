'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth-context';
import { api } from '../lib/api';
import { Radio, X, ArrowLeft, ShieldAlert, Sparkles } from 'lucide-react';

export default function PlatformBroadcastBanner() {
  const { isImpersonating, business, user, stopImpersonation } = useAuth();
  const [broadcast, setBroadcast] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.getPlatformSettings();
        if (res.success && res.data?.broadcast) {
          setBroadcast(res.data.broadcast);
        }
      } catch (err) {
        // Fallback or offline
      }
    }
    loadSettings();
  }, []);

  return (
    <>
      {/* 1. Super Admin Impersonation Banner */}
      {isImpersonating && business && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 text-white text-xs font-semibold px-4 py-2.5 flex items-center justify-between border-b border-purple-500/30 shadow-md sticky top-0 z-50 animate-fade-in">
          <div className="flex items-center gap-2 max-w-2xl truncate">
            <span className="p-1 rounded-md bg-purple-500/30 text-purple-200">
              <ShieldAlert className="w-3.5 h-3.5" />
            </span>
            <span className="text-purple-200">Super Admin Impersonation:</span>
            <span className="font-bold text-white truncate">
              Viewing & managing <span className="underline decoration-purple-400">{business.name}</span> as{' '}
              <span className="text-purple-300">{user?.name || 'Owner'}</span>
            </span>
          </div>

          <button
            onClick={() => stopImpersonation()}
            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center gap-1.5 text-[11px] font-bold shrink-0 ml-3"
          >
            <ArrowLeft className="w-3 h-3" />
            Exit Impersonation
          </button>
        </div>
      )}

      {/* 2. Platform Broadcast Announcement */}
      {broadcast?.enabled && !dismissed && broadcast?.message && (
        <div className="bg-amber-500 text-slate-950 text-xs font-bold px-4 py-2 flex items-center justify-between shadow-md relative z-40 animate-fade-in">
          <div className="flex items-center gap-2 mx-auto truncate max-w-4xl">
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping shrink-0" />
            <Radio className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{broadcast.message}</span>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-md hover:bg-amber-600 text-slate-950 transition shrink-0 ml-2"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
}

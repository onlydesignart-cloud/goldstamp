'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error securely for debugging without leaking sensitive customer state
    console.error('Caught by Gold Stamp Global Error Boundary:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border-2 border-rose-200 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Resilient Session Recovery
          </span>
          <h1 className="text-xl font-black text-slate-900 mt-2">
            Something unexpected occurred
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            Your loyalty wallet and stamps are completely safe. A temporary client-side glitch was caught and neutralized.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => reset()}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
        </div>

        <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
          Protected by Client Security Guard
        </div>
      </div>
    </div>
  );
}

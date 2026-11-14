'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm text-center space-y-5 animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto shadow-sm">
          <Compass className="w-8 h-8 text-emerald-600" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
            404 — Page Not Found
          </span>
          <h1 className="text-xl font-black text-slate-900 mt-2">
            Looking for a loyalty program?
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            The page or program you requested does not exist or has been moved to a new venue.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <Link
            href="/discover"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Discover Venues</span>
          </Link>

          <Link
            href="/"
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

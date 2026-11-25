'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Home, ArrowLeft, QrCode, Search, Award } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
        {/* Subtle gold glow behind icon */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* 404 Graphic Badge */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-slate-950 border-2 border-amber-400/50 text-amber-400 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/15">
            <Compass className="w-10 h-10 stroke-[2.2]" />
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black text-[11px] px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
            404 Error
          </span>
        </div>

        {/* Text Content */}
        <div className="space-y-2 pt-1">
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            The loyalty venue, campaign, or link you are trying to visit does not exist or has moved. Explore our directory of registered venues below.
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href="/discover"
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-3.5 rounded-xl transition shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95"
          >
            <Compass className="w-4 h-4 text-slate-950" />
            <span>Discover Venues</span>
          </Link>

          <Link
            href="/"
            className="flex-1 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs py-3.5 rounded-xl transition border border-slate-800 flex items-center justify-center gap-2 active:scale-95"
          >
            <Home className="w-4 h-4 text-amber-400" />
            <span>Homepage</span>
          </Link>
        </div>

        {/* Quick Helper Links */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-4 text-xs text-slate-500 font-medium">
          <Link href="/login" className="hover:text-amber-600 transition">
            Customer Login
          </Link>
          <span>&bull;</span>
          <Link href="/register" className="hover:text-amber-600 transition">
            Join as Customer
          </Link>
          <span>&bull;</span>
          <Link href="/client/login" className="hover:text-amber-600 transition">
            Merchant Console
          </Link>
        </div>
      </div>
    </div>
  );
}

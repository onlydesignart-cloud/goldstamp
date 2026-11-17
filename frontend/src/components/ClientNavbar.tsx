'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import {
  Store,
  QrCode,
  LogOut,
  ExternalLink,
  ShieldCheck,
  User,
  PlusCircle,
  Megaphone,
} from 'lucide-react';

export const ClientNavbar: React.FC = () => {
  const pathname = usePathname();
  const { user, business, logout } = useAuth();

  const isAuthPage =
    pathname?.startsWith('/client/login') ||
    pathname?.startsWith('/client/register') ||
    pathname?.startsWith('/client/verify-email');

  if (isAuthPage) return null;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand & Venue Display */}
          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="/client/dashboard" className="flex items-center gap-2.5 group py-1 shrink-0">
              <img
                src="/images/logo-dark.png"
                alt="GoldStamp"
                className="h-8 w-auto object-contain hover:opacity-95 transition-opacity"
              />
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider hidden md:inline-block">
                Merchant Hub
              </span>
            </Link>

            {/* Top Left Corner: Business Owner Name + Business Venue Name */}
            <div className="hidden sm:flex flex-col justify-center pl-4 border-l border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-white tracking-wide">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span className="text-slate-100 font-semibold">{user?.name || 'Business Owner'}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                  {user?.role === 'BUSINESS_STAFF' ? 'Staff' : 'Owner'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium pl-3.5 leading-tight">
                {business?.name || 'Active Venue'}
              </span>
            </div>
          </div>

          {/* Quick Counter Kiosk & Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/client/qr"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition active:scale-95"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Counter Kiosk</span>
            </Link>

            <Link
              href="/client/campaigns/create"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700 transition"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>New Campaign</span>
            </Link>

            {/* Signout Button only (Owner name is cleanly placed at top left) */}
            <div className="flex items-center pl-3 sm:pl-4 border-l border-slate-800">
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition text-xs font-medium"
                title="Sign Out of Merchant Hub"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

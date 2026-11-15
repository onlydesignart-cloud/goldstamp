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
          {/* Brand & Active Venue Badge */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/client/dashboard" className="flex items-center gap-3 group py-1">
              <img
                src="/images/logo-dark.png"
                alt="GoldStamp"
                className="h-8 w-auto object-contain hover:opacity-95 transition-opacity"
              />
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider hidden sm:inline-block">
                Merchant Hub
              </span>
            </Link>

            {/* Current Active Venue Display */}
            {business && (
              <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-semibold text-slate-200">{business.name}</span>
                <Link
                  href={`/business/${business.slug}`}
                  target="_blank"
                  className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition"
                  title="View Public Venue Page"
                >
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
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

            {/* Merchant Identity & Signout */}
            <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white">
                  {user ? user.name : 'Merchant Admin'}
                </div>
                <div className="text-[10px] font-medium flex items-center justify-end gap-1">
                  {user?.role === 'BUSINESS_STAFF' ? (
                    <span className="text-amber-400 font-bold">Counter Staff</span>
                  ) : (
                    <span className="text-emerald-400">Business Owner</span>
                  )}
                </div>
              </div>

              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition"
                title="Sign Out of Merchant Hub"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

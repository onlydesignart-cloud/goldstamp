'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth-context';
import { ADMIN_ROUTE_PREFIX } from '../config/adminRoute';
import {
  Shield,
  Activity,
  Store,
  Compass,
  LogOut,
  User,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const AdminNavbar: React.FC = () => {
  const { user, logout } = useAuth();

  const handleAdminLogout = () => {
    logout();
  };

  return (
    <header className="bg-slate-950 border-b border-slate-800 text-white sticky top-0 z-40 transition-colors shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand & Platform Badge */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href={`${ADMIN_ROUTE_PREFIX}/dashboard`} className="flex items-center gap-3 group py-1">
              <img
                src="/images/logo-dark.png"
                alt="GoldStamp"
                className="h-8 w-auto object-contain hover:opacity-95 transition-opacity"
              />
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider hidden sm:inline-block">
                Super Admin Vault
              </span>
            </Link>

            {/* Platform Status Pill */}
            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium">Core API & Engine: Operational</span>
            </div>
          </div>

          {/* Quick Cross-Portal Switchers & Admin Session */}
          <div className="flex items-center gap-3">
            {/* Quick Switch to Merchant View */}
            <Link
              href="/client/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition shadow-sm"
              title="Jump to Merchant Console"
            >
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Merchant Portal</span>
            </Link>

            {/* Quick Switch to Customer View */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition shadow-sm"
              title="View Public Customer Storefront"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Customer App</span>
            </Link>

            {/* Admin User Badge & Signout */}
            <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white">
                  Platform Admin
                </div>
                <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                  SUPER_ADMIN
                </div>
              </div>

              <button
                onClick={handleAdminLogout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 transition text-xs font-semibold"
                title="Sign Out of Super Admin Vault"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

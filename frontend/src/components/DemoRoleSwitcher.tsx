'use client';

import React, { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { mockStore } from '../lib/mockStore';
import {
  Shield,
  Store,
  User as UserIcon,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Zap,
  RotateCcw,
  ExternalLink,
  Database,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

export const DemoRoleSwitcher: React.FC = () => {
  const { user, business, switchDemoRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleClearFreshStart = () => {
    mockStore.clearAllData();
    setResetMessage('All data emptied! Starting fresh...');
    setTimeout(() => {
      setResetMessage(null);
      window.location.href = '/';
    }, 600);
  };

  const handleResetData = () => {
    mockStore.resetToSeed();
    setResetMessage('Data restored to initial state!');
    setTimeout(() => {
      setResetMessage(null);
      window.location.reload();
    }, 800);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 print:hidden font-sans">
      {/* Expanded Persona Switcher Tray */}
      {isOpen && (
        <div className="mb-2 bg-slate-900/95 backdrop-blur-md border border-slate-800 text-slate-200 rounded-2xl shadow-2xl p-4 w-84 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Database className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">LocalStorage Testing Engine</span>
                <span className="text-[10px] text-emerald-400 block font-medium">● In-Browser Persistence Active</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Role Switch Buttons */}
          <div className="py-2.5 space-y-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block px-1">
              Select Active Persona:
            </span>

            {/* 1. Customer Panel Persona */}
            <button
              onClick={() => {
                switchDemoRole('customer');
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                user?.role === 'CUSTOMER'
                  ? 'bg-emerald-600 text-white font-medium shadow-md shadow-emerald-900/30'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                <div className="text-left">
                  <div className="font-medium">1. Customer Panel</div>
                  <div className="text-[10px] opacity-75">Alex Rivera • Stamp cards & QR check-in</div>
                </div>
              </div>
              {user?.role === 'CUSTOMER' && <CheckCircle2 className="w-4 h-4 text-white" />}
            </button>

            {/* 2. Merchant Panel Persona */}
            <button
              onClick={() => {
                switchDemoRole('smashzone');
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                user?.role === 'BUSINESS_OWNER'
                  ? 'bg-emerald-600 text-white font-medium shadow-md shadow-emerald-900/30'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Store className="w-3.5 h-3.5 text-amber-400" />
                <div className="text-left">
                  <div className="font-medium">2. Merchant Panel</div>
                  <div className="text-[10px] opacity-75">Rohan Mehta • SmashZone Pickleball Hub</div>
                </div>
              </div>
              {user?.role === 'BUSINESS_OWNER' && <CheckCircle2 className="w-4 h-4 text-white" />}
            </button>

            {/* 3. Platform Admin Panel Persona */}
            <button
              onClick={() => {
                switchDemoRole('admin');
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                user?.role === 'SUPER_ADMIN'
                  ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-900/30'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <div className="text-left">
                  <div className="font-medium">3. Platform Admin Panel</div>
                  <div className="text-[10px] opacity-75">System Owner • Businesses & MRR</div>
                </div>
              </div>
              {user?.role === 'SUPER_ADMIN' && <CheckCircle2 className="w-4 h-4 text-white" />}
            </button>
          </div>

          {/* Quick Panel Links */}
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-1 text-[11px] text-center">
            <Link
              href="/loyalty"
              onClick={() => setIsOpen(false)}
              className="py-1 px-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white"
            >
              Customer Hub
            </Link>
            <Link
              href="/client/dashboard"
              onClick={() => setIsOpen(false)}
              className="py-1 px-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white"
            >
              Merchant Hub
            </Link>
            <Link
              href="/admin/dashboard"
              onClick={() => setIsOpen(false)}
              className="py-1 px-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white"
            >
              Admin Hub
            </Link>
          </div>

          {/* Action Buttons: Reset & Empty Data */}
          <div className="pt-2.5 mt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleClearFreshStart}
                className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition font-medium"
                title="Wipe visits, stamps and logout for a 100% clean test"
              >
                <Trash2 className="w-3 h-3" />
                <span>Empty All Data</span>
              </button>
              <button
                onClick={handleResetData}
                className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1.5 transition"
                title="Reset all test records back to initial seed data"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Seed</span>
              </button>
            </div>
            {resetMessage && (
              <span className="text-[10px] text-emerald-400 font-medium block text-center animate-pulse">
                {resetMessage}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Floating Collapsed Pill Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-900 text-slate-200 border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs font-semibold transition hover:scale-105 active:scale-95 group"
        title="Toggle LocalStorage testing panel switcher"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-slate-300 group-hover:text-white">
          {user ? `Testing: ${user.name.split(' ')[0]} (${user.role.replace('_', ' ')})` : 'LocalStorage Testing'}
        </span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
      </button>
    </div>
  );
};

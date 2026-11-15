'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_ROUTE_PREFIX } from '../config/adminRoute';
import {
  Shield,
  Building2,
  Users,
  Layers,
  CreditCard,
  BarChart2,
  FileText,
  Sliders,
  ShieldAlert,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { label: 'Overview', href: `${ADMIN_ROUTE_PREFIX}/dashboard`, icon: Shield },
    { label: 'Businesses', href: `${ADMIN_ROUTE_PREFIX}/businesses`, icon: Building2 },
    { label: 'Users', href: `${ADMIN_ROUTE_PREFIX}/users`, icon: Users },
    { label: 'Industries', href: `${ADMIN_ROUTE_PREFIX}/industries`, icon: Layers },
    { label: 'Subscriptions', href: `${ADMIN_ROUTE_PREFIX}/subscriptions`, icon: CreditCard },
    { label: 'Platform Analytics', href: `${ADMIN_ROUTE_PREFIX}/analytics`, icon: BarChart2 },
    { label: 'Audit & Anti-Fraud', href: `${ADMIN_ROUTE_PREFIX}/settings`, icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 hidden md:flex border-r border-slate-800">
      <div>
        <div className="mb-6 px-3.5 py-3 rounded-2xl bg-slate-950/80 border border-slate-800/90 shadow-sm">
          <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
            Super Admin Vault
          </div>
          <div className="text-xs font-bold text-white mt-1">Platform Master Console</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">ID: GS-VAULT-8821</div>
        </div>

        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between font-bold text-slate-300">
          <span>Security Clearance</span>
          <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">L3 ROOT</span>
        </div>
        <p className="text-[10px] text-slate-400">Zero-Trust Obfuscated Endpoint</p>
      </div>
    </aside>
  );
};

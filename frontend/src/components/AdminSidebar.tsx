'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  Building2,
  Users,
  Layers,
  CreditCard,
  BarChart2,
  FileText,
  Sliders,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { label: 'Overview', href: '/admin/dashboard', icon: Shield },
    { label: 'Businesses', href: '/admin/businesses', icon: Building2 },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Industries', href: '/admin/industries', icon: Layers },
    { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
    { label: 'Platform Analytics', href: '/admin/analytics', icon: BarChart2 },
    { label: 'Audit Logs', href: '/admin/settings', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 hidden md:flex border-r border-slate-800">
      <div>
        <div className="mb-6 px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
          <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            Super Admin Control
          </div>
          <div className="text-sm font-bold text-white mt-1">Platform Master Console</div>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-purple-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800 px-2 text-[11px] text-slate-500">
        <div>Gold Stamp Engine v1.0.0</div>
        <div>SaaS Master Role: SUPER_ADMIN</div>
      </div>
    </aside>
  );
};

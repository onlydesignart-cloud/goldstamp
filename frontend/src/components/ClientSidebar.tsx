'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import {
  LayoutDashboard,
  Megaphone,
  QrCode,
  CheckCircle2,
  Users,
  Footprints,
  BarChart3,
  CreditCard,
  UserCheck,
  Settings,
  Building2,
  ExternalLink,
  Shield,
  Lock,
} from 'lucide-react';

export const ClientSidebar: React.FC = () => {
  const pathname = usePathname();
  const { business, user } = useAuth();

  const isStaff = user?.role === 'BUSINESS_STAFF';

  const staffLinks = [
    { label: 'Overview', href: '/client/dashboard', icon: LayoutDashboard },
    { label: 'Dynamic QR Kiosk', href: '/client/qr', icon: QrCode },
    { label: 'Redemptions', href: '/client/redemptions', icon: CheckCircle2 },
    { label: 'Visits Ledger', href: '/client/visits', icon: Footprints },
    { label: 'Customers', href: '/client/customers', icon: Users },
  ];

  const ownerLinks = [
    { label: 'Overview', href: '/client/dashboard', icon: LayoutDashboard },
    { label: 'Campaigns', href: '/client/campaigns', icon: Megaphone },
    { label: 'Dynamic QR Kiosk', href: '/client/qr', icon: QrCode },
    { label: 'Redemptions', href: '/client/redemptions', icon: CheckCircle2 },
    { label: 'Visits Ledger', href: '/client/visits', icon: Footprints },
    { label: 'Customers', href: '/client/customers', icon: Users },
    { label: 'Analytics', href: '/client/analytics', icon: BarChart3 },
    { label: 'Staff Logins', href: '/client/staff', icon: UserCheck },
    { label: 'Subscription', href: '/client/subscription', icon: CreditCard },
    { label: 'Settings', href: '/client/settings', icon: Settings },
    { label: 'Business Profile', href: '/client/profile', icon: Building2 },
  ];

  const links = isStaff ? staffLinks : ownerLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 hidden md:flex">
      <div>
        <div className="mb-6 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Active Tenant
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isStaff
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isStaff ? 'STAFF MODE' : 'OWNER'}
            </span>
          </div>

          <div className="text-sm font-bold text-slate-900 truncate mt-1">
            {business ? business.name : 'Business Console'}
          </div>

          {user && (
            <div className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
              Signed in: {user.name}
            </div>
          )}

          {business?.slug && (
            <Link
              href={`/business/${business.slug}`}
              target="_blank"
              className="text-[11px] text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-1.5 font-medium"
            >
              View Public Page <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {isStaff && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Lock className="w-3 h-3 text-amber-700" />
              <span>RBAC Scope Active</span>
            </div>
            <p className="text-[10px] text-amber-700 leading-tight">
              Counter permissions only. Billing and campaign management are hidden for staff logins.
            </p>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 px-2 text-xs text-slate-400">
        <div>Gold Stamp SaaS Client v1.0</div>
        <div className="text-[10px] text-slate-400">
          Role: <span className="font-semibold text-slate-600">{user?.role || 'BUSINESS_OWNER'}</span>
        </div>
      </div>
    </aside>
  );
};

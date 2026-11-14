'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Stamp, Gift, QrCode, User } from 'lucide-react';

export const CustomerBottomNav: React.FC = () => {
  const pathname = usePathname();

  // Don't show bottom nav on client or admin portals
  if (pathname.startsWith('/client') || pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { label: 'Discover', href: '/discover', icon: Compass },
    { label: 'Loyalty', href: '/loyalty', icon: Stamp },
    { label: 'Check-In', href: '/checkin', icon: QrCode, highlight: true },
    { label: 'Rewards', href: '/rewards', icon: Gift },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-13 h-13 p-3 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center transition hover:scale-105 active:scale-95">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 mt-1">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 transition ${
                isActive ? 'text-emerald-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

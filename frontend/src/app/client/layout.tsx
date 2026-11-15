'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ClientNavbar } from '../../components/ClientNavbar';
import { ClientSidebar } from '../../components/ClientSidebar';
import { useAuth } from '../../lib/auth-context';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const isAuthPage =
    pathname?.startsWith('/client/login') ||
    pathname?.startsWith('/client/register') ||
    pathname?.startsWith('/client/verify-email');

  useEffect(() => {
    if (!loading && !isAuthPage) {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('goldstamp_merchant_token') : null;
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('goldstamp_merchant_user') : null;

      if (!storedToken || !storedUser) {
        router.replace('/client/login');
      }
    }
  }, [loading, isAuthPage, router]);

  if (isAuthPage) {
    return <div className="min-h-screen bg-slate-950 text-slate-100">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <ClientNavbar />
      <div className="flex flex-1 min-h-[calc(100vh-4rem)]">
        <ClientSidebar />
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </div>
      </div>
    </div>
  );
}

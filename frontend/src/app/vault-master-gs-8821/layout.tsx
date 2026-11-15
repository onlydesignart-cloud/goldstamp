'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminNavbar } from '../../components/AdminNavbar';
import { AdminSidebar } from '../../components/AdminSidebar';
import { useAuth } from '../../lib/auth-context';
import { ADMIN_ROUTE_PREFIX } from '../../config/adminRoute';

export default function VaultMasterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const isLoginPage = pathname === `${ADMIN_ROUTE_PREFIX}/login`;

  useEffect(() => {
    if (!loading && !isLoginPage) {
      // Guard: only allow authenticated SUPER_ADMIN into the vault
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('goldstamp_admin_token') : null;
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('goldstamp_admin_user') : null;
      
      if (!storedToken || !storedUser) {
        router.replace(`${ADMIN_ROUTE_PREFIX}/login`);
      }
    }
  }, [loading, isLoginPage, router]);

  // Login page has NO navbar, NO sidebar, NO distraction - pure high security vault form
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500/30">
      <AdminNavbar />
      <div className="flex flex-1 min-h-[calc(100vh-4rem)]">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

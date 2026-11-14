import React from 'react';
import { AdminNavbar } from '../../components/AdminNavbar';
import { AdminSidebar } from '../../components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
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

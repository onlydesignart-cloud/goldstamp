import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '../lib/auth-context';
import { Navbar } from '../components/Navbar';
import { CustomerBottomNav } from '../components/CustomerBottomNav';
import PlatformBroadcastBanner from '../components/PlatformBroadcastBanner';

export const metadata: Metadata = {
  title: 'Gold Stamp — Multi-Tenant Digital Loyalty & Stamp SaaS Platform',
  icons: { icon: '/favicon.ico', apple: '/logo-icon.png' },
  description:
    'Complete multi-tenant digital loyalty platform for cafés, pickleball, gyms, salons, arenas, and local businesses to engage customers with digital stamp cards, visits, points, and rewards.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-16 md:pb-0">
        <AuthProvider>
          <PlatformBroadcastBanner />
          <Navbar />
          <main className="flex-1">{children}</main>
          <CustomerBottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}

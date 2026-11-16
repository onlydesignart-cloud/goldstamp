'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import {
  QrCode,
  Compass,
  Gift,
  LayoutDashboard,
  Shield,
  User as UserIcon,
  Menu,
  X,
  Store,
  LogOut,
  ChevronRight,
  Layers,
  Award
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, business, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Isolate portals: Do not render Customer Navbar on Merchant or Admin portals
  if (pathname?.startsWith('/client') || pathname?.startsWith('/admin')) {
    return null;
  }

  const isCustomer = user?.role === 'CUSTOMER';
  const isBusiness = user?.role === 'BUSINESS_OWNER' || user?.role === 'BUSINESS_STAFF';
  const isAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group py-1">
              <img
                src="/images/logo.png"
                alt="GoldStamp"
                className="h-9 sm:h-10 w-auto object-contain hover:opacity-95 transition-opacity"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link
                href="/discover"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  pathname === '/discover'
                    ? 'text-slate-950 font-semibold bg-slate-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Discover Venues
              </Link>

              {/* Dynamic Role Navigation */}
              {isCustomer && (
                <>
                  <Link
                    href="/loyalty"
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      pathname === '/loyalty'
                        ? 'text-slate-950 font-semibold bg-slate-100'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    My Loyalty Cards
                  </Link>
                  <Link
                    href="/rewards"
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      pathname === '/rewards'
                        ? 'text-slate-950 font-semibold bg-slate-100'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    My Rewards
                  </Link>
                  <Link
                    href="/profile"
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                      pathname === '/profile'
                        ? 'text-slate-950 font-semibold bg-slate-100'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>My Profile</span>
                    {!user?.phone && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full border border-amber-300 animate-pulse">
                        Link WhatsApp
                      </span>
                    )}
                  </Link>
                </>
              )}

              {isBusiness && (
                <>
                  <Link
                    href="/client/dashboard"
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      pathname?.startsWith('/client/dashboard')
                        ? 'text-slate-950 font-semibold bg-slate-100'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/client/qr"
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      pathname === '/client/qr'
                        ? 'text-slate-950 font-semibold bg-slate-100'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Counter Kiosk
                  </Link>
                  <Link
                    href="/client/redemptions"
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      pathname === '/client/redemptions'
                        ? 'text-slate-950 font-semibold bg-slate-100'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Redeem Code
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    pathname?.startsWith('/admin')
                      ? 'text-indigo-900 font-semibold bg-indigo-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Admin Console
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {isCustomer && (
                  <Link
                    href="/checkin"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Scan Check-In</span>
                  </Link>
                )}

                <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                  <Link
                    href={isCustomer ? '/profile' : isBusiness ? '/client/dashboard' : '/admin/dashboard'}
                    className="flex items-center gap-2.5 p-1 px-2.5 rounded-xl hover:bg-slate-100 transition border border-slate-200/80 bg-white shadow-xs group"
                    title="Profile & Settings"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-900 group-hover:bg-emerald-600 transition text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                        <span>{user.name}</span>
                        {isCustomer && !user.phone && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="WhatsApp Pending"></span>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {isCustomer ? (
                          user.phone ? (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              WhatsApp Active
                            </span>
                          ) : (
                            <span className="text-amber-700 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              Link WhatsApp
                            </span>
                          )
                        ) : business ? (
                          business.name
                        ) : (
                          'Profile & Settings'
                        )}
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 transition rounded-lg hover:bg-slate-100"
                >
                  Customer Login
                </Link>

                <Link
                  href="/client/register"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-950 hover:bg-slate-800 rounded-lg shadow-sm transition active:scale-95"
                >
                  <span>Register Business</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {user && isCustomer && (
              <Link
                href="/checkin"
                className="p-2 rounded-lg bg-emerald-600 text-white"
                title="Scan QR"
              >
                <QrCode className="w-4 h-4" />
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            <Link
              href="/discover"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Discover Venues
            </Link>

            {isCustomer && (
              <>
                <Link
                  href="/loyalty"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  My Loyalty Cards
                </Link>
                <Link
                  href="/rewards"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  My Rewards
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <span className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-emerald-600" />
                    <span>My Profile</span>
                  </span>
                  {!user?.phone && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                      Link WhatsApp
                    </span>
                  )}
                </Link>
              </>
            )}

            {isBusiness && (
              <>
                <Link
                  href="/client/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Merchant Dashboard
                </Link>
                <Link
                  href="/client/qr"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Counter Kiosk
                </Link>
              </>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {user ? (
              <div className="px-2">
                <Link
                  href={isCustomer ? '/profile' : isBusiness ? '/client/dashboard' : '/admin/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition border border-slate-200/80"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[10px] text-slate-500">View & Edit Profile</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition rounded-lg"
                >
                  Customer Login
                </Link>
                <Link
                  href="/client/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold text-white bg-slate-950 hover:bg-slate-800 transition rounded-lg"
                >
                  Register Business
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

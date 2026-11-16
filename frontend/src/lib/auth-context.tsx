'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { api, API_BASE_URL } from './api';
import { mockStore } from './mockStore';
import { createClient } from '../utils/supabase/client';

import { ADMIN_ROUTE_PREFIX } from '../config/adminRoute';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'SUPER_ADMIN' | 'BUSINESS_OWNER' | 'BUSINESS_STAFF' | 'CUSTOMER';
  status: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  cooldownMinutes: number;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  settings?: any;
}

interface AuthContextType {
  user: User | null;
  business: Business | null;
  loading: boolean;
  isImpersonating: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithWhatsApp: (phone: string, otp?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (googleData?: { email?: string; name?: string; avatar?: string }) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: { name?: string; phone?: string; email?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchDemoRole: (target: 'admin' | 'smashzone' | 'cafe' | 'customer') => Promise<void>;
  refreshProfile: () => Promise<void>;
  impersonateBusiness: (businessId: string) => Promise<void>;
  stopImpersonation: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [loading, setLoading] = useState(true);

  const isClientPortal = pathname?.startsWith('/client');
  const isAdminPortal = pathname?.startsWith(ADMIN_ROUTE_PREFIX) || pathname?.startsWith('/vault-master-gs-8821') || pathname?.startsWith('/admin');

  const refreshProfile = async () => {
    try {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      // One-time purge of legacy development/test credentials from localStorage
      if (!localStorage.getItem('goldstamp_production_cleaned_v1')) {
        localStorage.removeItem('goldstamp_merchant_user');
        localStorage.removeItem('goldstamp_merchant_token');
        localStorage.removeItem('goldstamp_merchant_business');
        localStorage.removeItem('goldstamp_impersonation_biz_id');
        localStorage.removeItem('goldstamp_customer_user');
        localStorage.removeItem('goldstamp_customer_token');
        localStorage.removeItem('goldstamp_user');
        localStorage.removeItem('goldstamp_token');
        localStorage.removeItem('goldstamp_local_test_db_v1');
        localStorage.setItem('goldstamp_production_cleaned_v1', 'true');
      }

      if (isClientPortal) {
        // Merchant Portal Session (Strict Authentication - No Auto-Login)
        const impBizId = localStorage.getItem('goldstamp_impersonation_biz_id');
        if (impBizId) {
          const impBiz = mockStore.getRaw().businesses.find((b: any) => b.id === impBizId);
          if (impBiz) {
            const owner = mockStore.getUserById(impBiz.ownerId);
            setUser(owner || null);
            setBusiness(impBiz);
            setIsImpersonating(true);
            setLoading(false);
            return;
          }
        }
        setIsImpersonating(false);

        const stored = localStorage.getItem('goldstamp_merchant_user');
        const token = localStorage.getItem('goldstamp_merchant_token');
        let currentMerchant: any = null;
        if (stored && token) {
          try {
            const parsed = JSON.parse(stored);
            currentMerchant = mockStore.getUserById(parsed.id) || mockStore.getUserByEmail(parsed.email);
          } catch {}
        }

        if (currentMerchant) {
          setUser(currentMerchant);
          const biz = mockStore.getBusinessByOwnerId(currentMerchant.id);
          setBusiness(biz || null);
        } else {
          setUser(null);
          setBusiness(null);
        }
      } else if (isAdminPortal) {
        // Super Admin Vault Session (Strict Authentication - No Auto-Login)
        const stored = localStorage.getItem('goldstamp_admin_user');
        const token = localStorage.getItem('goldstamp_admin_token');
        let currentAdmin: any = null;
        if (stored && token) {
          try {
            const parsed = JSON.parse(stored);
            currentAdmin = mockStore.getUserById(parsed.id) || parsed;
          } catch {}
        }
        setUser(currentAdmin || null);
        setBusiness(null);
      } else {
        // Customer / Public Session
        const stored = localStorage.getItem('goldstamp_customer_user') || localStorage.getItem('goldstamp_user');
        const token = localStorage.getItem('goldstamp_customer_token') || localStorage.getItem('goldstamp_token');
        let resolvedUser: any = null;

        if (stored && token) {
          try {
            const parsed = JSON.parse(stored);
            resolvedUser = mockStore.getUserById(parsed.id) || mockStore.getUserByEmail(parsed.email);
          } catch {}
        }

        // Check live Supabase Auth session (e.g. after Google OAuth redirect)
        if (!resolvedUser && typeof window !== 'undefined') {
          try {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              const supaUser = session.user;
              const cleanEmail = supaUser.email?.toLowerCase() || '';
              resolvedUser = mockStore.getUserByEmail(cleanEmail);
              if (!resolvedUser && cleanEmail) {
                resolvedUser = mockStore.createUser({
                  name: supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || cleanEmail.split('@')[0],
                  email: cleanEmail,
                  phone: supaUser.phone || '',
                  role: 'CUSTOMER',
                  status: 'ACTIVE',
                  avatar: supaUser.user_metadata?.avatar_url || null,
                });

                // Sync Google user directly to live PostgreSQL database (public.User table)
                fetch(`${API_BASE_URL}/api/v1/auth/register`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: resolvedUser.name,
                    email: resolvedUser.email,
                    phone: resolvedUser.phone || '',
                    password: `OAuth_${supaUser.id.substring(0, 10)}!`,
                    role: 'CUSTOMER',
                  }),
                }).catch((e) => console.warn('Google user backend sync notice:', e));
              }
              if (resolvedUser) {
                localStorage.setItem('goldstamp_customer_token', session.access_token);
                localStorage.setItem('goldstamp_customer_user', JSON.stringify(resolvedUser));
                localStorage.setItem('goldstamp_user', JSON.stringify(resolvedUser));
                localStorage.setItem('goldstamp_token', session.access_token);
              }
            }
          } catch (supaErr) {
            console.warn('Supabase session load notice:', supaErr);
          }
        }

        setUser(resolvedUser || null);
        setBusiness(null);
      }
    } catch (err) {
      console.error('Failed to resolve auth profile:', err);
      setUser(null);
      setBusiness(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();

    // Listen to live Supabase Auth OAuth events
    if (typeof window !== 'undefined' && !isClientPortal && !isAdminPortal) {
      try {
        const supabase = createClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const supaUser = session.user;
            const cleanEmail = supaUser.email?.toLowerCase() || '';
            let resolved = mockStore.getUserByEmail(cleanEmail);
            if (!resolved && cleanEmail) {
              resolved = mockStore.createUser({
                name: supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || cleanEmail.split('@')[0],
                email: cleanEmail,
                phone: supaUser.phone || '',
                role: 'CUSTOMER',
                status: 'ACTIVE',
                avatar: supaUser.user_metadata?.avatar_url || null,
              });

              // Sync Google user directly to live PostgreSQL database (public.User table)
              fetch(`${API_BASE_URL}/api/v1/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: resolved.name,
                  email: resolved.email,
                  phone: resolved.phone || '',
                  password: `OAuth_${supaUser.id.substring(0, 10)}!`,
                  role: 'CUSTOMER',
                }),
              }).catch((e) => console.warn('Google user backend sync notice:', e));
            }
            if (resolved) {
              localStorage.setItem('goldstamp_customer_token', session.access_token);
              localStorage.setItem('goldstamp_customer_user', JSON.stringify(resolved));
              localStorage.setItem('goldstamp_user', JSON.stringify(resolved));
              localStorage.setItem('goldstamp_token', session.access_token);
              setUser(resolved);
            }
          }
        });
        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.warn('Supabase auth listener note:', err);
      }
    }
  }, [pathname]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const res = await api.login({ email, password });
    if (res.success && res.data) {
      setUser(res.data.user);
      setBusiness(res.data.business || null);
      setLoading(false);
      return { success: true };
    }
    setLoading(false);
    return { success: false, error: res.error?.message || 'Login failed' };
  };

  const loginWithWhatsApp = async (phone: string, otp?: string) => {
    setLoading(true);
    try {
      const res = await api.loginWithWhatsApp(phone, otp);
      if (res.success && res.data) {
        setUser(res.data.user);
        setBusiness(null);
        setLoading(false);
        return { success: true };
      }
      setLoading(false);
      return { success: false, error: res.error?.message || 'WhatsApp verification failed' };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err?.message || 'Failed to verify WhatsApp' };
    }
  };

  const loginWithGoogle = async (googleData?: { email?: string; name?: string; avatar?: string }) => {
    setLoading(true);
    try {
      const res = await api.loginWithGoogle(googleData);
      if (res.success && res.data) {
        setUser(res.data.user);
        setBusiness(null);
        setLoading(false);
        return { success: true };
      }
      setLoading(false);
      return { success: false, error: res.error?.message || 'Google sign-in failed' };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err?.message || 'Failed to sign in with Google' };
    }
  };

  const register = async (data: any) => {
    setLoading(true);
    const res = await api.register(data);
    if (res.success && res.data) {
      if (res.data.pending) {
        // Merchant pending email confirmation: do NOT set user or business into session
        setLoading(false);
        return {
          success: true,
          pending: true,
          email: res.data.email,
          verificationToken: res.data.verificationToken,
          businessName: res.data.businessName,
          message: res.data.message,
        };
      }
      setUser(res.data.user);
      setBusiness(res.data.business || null);
      setLoading(false);
      return { success: true };
    }
    setLoading(false);
    return { success: false, error: res.error?.message || 'Registration failed' };
  };

  const updateProfile = async (updates: { name?: string; phone?: string; email?: string }) => {
    setLoading(true);
    const res = await api.updateProfile(updates);
    if (res.success && res.data) {
      setUser(res.data);
      setLoading(false);
      return { success: true };
    }
    setLoading(false);
    return { success: false, error: res.error?.message || 'Failed to update profile' };
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      if (isClientPortal) {
        localStorage.removeItem('goldstamp_merchant_token');
        localStorage.removeItem('goldstamp_merchant_user');
        localStorage.removeItem('goldstamp_merchant_business');
        setUser(null);
        setBusiness(null);
        window.location.href = '/client/login';
      } else if (isAdminPortal) {
        localStorage.removeItem('goldstamp_admin_token');
        localStorage.removeItem('goldstamp_admin_user');
        setUser(null);
        setBusiness(null);
        window.location.href = `${ADMIN_ROUTE_PREFIX}/login`;
      } else {
        localStorage.removeItem('goldstamp_customer_token');
        localStorage.removeItem('goldstamp_customer_user');
        localStorage.removeItem('goldstamp_user');
        localStorage.removeItem('goldstamp_token');
        setUser(null);
        setBusiness(null);
        window.location.href = '/';
      }
    }
  };

  const switchDemoRole = async (target: 'admin' | 'smashzone' | 'cafe' | 'customer') => {
    let email = 'alex@example.com';
    let password = 'customer123';

    if (target === 'admin') {
      email = 'admin@example.com';
      password = 'admin123';
      const user = mockStore.getUserByEmail(email);
      if (user && typeof window !== 'undefined') {
        localStorage.setItem('goldstamp_admin_user', JSON.stringify(user));
        localStorage.setItem('goldstamp_admin_token', `mock_admin_${Date.now()}`);
      }
      window.location.href = '/admin/dashboard';
      return;
    }

    if (target === 'smashzone') {
      email = 'owner@smashzone.com';
      password = 'owner123';
      const user = mockStore.getUserByEmail(email);
      const biz = mockStore.getBusinessByOwnerId(user?.id);
      if (user && typeof window !== 'undefined') {
        localStorage.setItem('goldstamp_merchant_user', JSON.stringify(user));
        localStorage.setItem('goldstamp_merchant_token', `mock_merchant_${Date.now()}`);
        if (biz) localStorage.setItem('goldstamp_merchant_business', JSON.stringify(biz));
      }
      window.location.href = '/client/dashboard';
      return;
    }

    if (target === 'cafe') {
      email = 'owner@cafeartisan.com';
      password = 'owner123';
      const user = mockStore.getUserByEmail(email);
      const biz = mockStore.getBusinessByOwnerId(user?.id);
      if (user && typeof window !== 'undefined') {
        localStorage.setItem('goldstamp_merchant_user', JSON.stringify(user));
        localStorage.setItem('goldstamp_merchant_token', `mock_merchant_${Date.now()}`);
        if (biz) localStorage.setItem('goldstamp_merchant_business', JSON.stringify(biz));
      }
      window.location.href = '/client/dashboard';
      return;
    }

    // Customer
    const user = mockStore.getUserByEmail('alex@example.com');
    if (user && typeof window !== 'undefined') {
      localStorage.setItem('goldstamp_customer_user', JSON.stringify(user));
      localStorage.setItem('goldstamp_user', JSON.stringify(user));
      localStorage.setItem('goldstamp_customer_token', `mock_customer_${Date.now()}`);
    }
    window.location.href = '/loyalty';
  };

  const impersonateBusiness = async (businessId: string) => {
    if (typeof window === 'undefined') return;
    const biz = mockStore.getRaw().businesses.find((b: any) => b.id === businessId);
    if (!biz) return;
    const owner = mockStore.getUserById(biz.ownerId) || mockStore.getUserByEmail('owner@smashzone.com');
    localStorage.setItem('goldstamp_impersonation_biz_id', businessId);
    if (owner) {
      localStorage.setItem('goldstamp_merchant_user', JSON.stringify(owner));
      localStorage.setItem('goldstamp_merchant_token', `mock_imp_${owner.id}`);
    }
    localStorage.setItem('goldstamp_merchant_business', JSON.stringify(biz));
    setIsImpersonating(true);
    setBusiness(biz);
    if (owner) setUser(owner);
    window.location.href = '/client/dashboard';
  };

  const stopImpersonation = async () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('goldstamp_impersonation_biz_id');
    setIsImpersonating(false);
    window.location.href = '/admin/businesses';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        loading,
        isImpersonating,
        login,
        loginWithWhatsApp,
        loginWithGoogle,
        register,
        updateProfile,
        logout,
        switchDemoRole,
        refreshProfile,
        impersonateBusiness,
        stopImpersonation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

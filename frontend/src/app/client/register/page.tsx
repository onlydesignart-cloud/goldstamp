'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import {
  Store,
  Mail,
  Lock,
  User,
  Phone,
  Building,
  MapPin,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const INDUSTRIES = [
  'Pickleball Arena',
  'Specialty Café & Bakery',
  'Box Cricket Arena',
  'Salon & Luxury Spa',
  'Boutique Gym & Fitness',
  'Gaming Zone & Esports',
  'Car Wash & Detailing',
  'Restaurant & Bistro',
  'Entertainment Venue',
  'Other Local Commerce'
];

export default function MerchantRegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    industry: 'Pickleball Arena',
    city: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Register user as BUSINESS_OWNER
      const res = await register({
        name: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'BUSINESS_OWNER',
      });

      if (!res.success) {
        setError(res.error || 'Failed to register merchant account');
        setLoading(false);
        return;
      }

      // Create new business record in local test store
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('goldstamp_local_test_db_v1');
        if (raw) {
          const db = JSON.parse(raw);
          const bizSlug = formData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const newBiz = {
            id: `biz_${Date.now()}`,
            name: formData.businessName,
            slug: bizSlug,
            ownerId: (res as any)?.data?.user?.id || 'usr_new',
            industryId: 'ind_pickleball',
            industry: { name: formData.industry, slug: 'custom' },
            logo: null,
            coverImage: '/images/hero-counter.jpg',
            description: `Premier ${formData.industry} in ${formData.city}`,
            address: formData.city,
            city: formData.city,
            phone: formData.phone,
            email: formData.email,
            status: 'ACTIVE',
            cooldownMinutes: 30,
            createdAt: new Date().toISOString(),
          };
          db.businesses.push(newBiz);
          localStorage.setItem('goldstamp_local_test_db_v1', JSON.stringify(db));
        }
      }

      // 2. Redirect to merchant login
      router.push('/client/login?registered=true');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/70 backdrop-blur-xl p-8 sm:p-10 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Register Your Business</h1>
              <p className="text-xs text-slate-400">Launch a digital loyalty program in less than 2 minutes</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
            14-Day Free Trial
          </span>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Business / Venue Name</label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="e.g. Apex Pickleball Club"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Industry Category</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white transition"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind} className="bg-slate-900 text-white">
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Owner / Manager Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="Full Name"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">City / Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Surat, Gujarat"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@yourbusiness.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 transition"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Includes 60-second dynamic counter QR kiosk access</span>
            </div>
            <p className="text-slate-400 pl-5">
              No hardware purchases required. Works on any smartphone, iPad, or tablet at your checkout counter.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Creating Your Merchant Hub...' : 'Create Merchant Account & Launch'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Already registered?{' '}
            <Link href="/client/login" className="text-emerald-400 hover:underline font-medium">
              Sign in to Merchant Console
            </Link>
          </div>
          <div>
            <Link href="/login" className="text-slate-400 hover:text-white transition">
              Customer Sign In →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

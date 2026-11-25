'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import { Building2, Save, CheckCircle2, MapPin, Globe, Phone, Mail } from 'lucide-react';
import { ImageUploader } from '../../../components/ImageUploader';

export default function ClientProfilePage() {
  const { business, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [logo, setLogo] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      if (!business) return;
      try {
        const res = await api.getMyBusiness();
        if (res.success && res.data) {
          const b = res.data;
          setName(b.name || '');
          setDescription(b.description || '');
          setPhone(b.phone || '');
          setEmail(b.email || '');
          setWebsite(b.website || '');
          setAddress(b.address || '');
          setCity(b.city || '');
          setState(b.state || '');
          setLogo(b.logo || '');
          setCoverImage(b.coverImage || '');
        }
      } catch (err) {
        console.error('Failed to load business info:', err);
      }
    }
    load();
  }, [business]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    setSaving(true);
    setSaved(false);

    try {
      const res = await api.updateBusiness(business.id, {
        name,
        description,
        phone,
        email,
        website,
        address,
        city,
        state,
        logo,
        coverImage,
      });

      if (res.success) {
        setSaved(true);
        await refreshProfile();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Business Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your public storefront, logo, cover image, and contact information.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Business Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Description / Tagline</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Contact Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Website URL</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
            <ImageUploader
              label="Business Logo"
              value={logo}
              onChange={setLogo}
              folder="businesses"
              aspectRatio="square"
              hint="Square format (500x500px). Displays on digital passes."
            />
            <ImageUploader
              label="Storefront Cover Banner"
              value={coverImage}
              onChange={setCoverImage}
              folder="businesses"
              aspectRatio="video"
              hint="Wide banner (1200x600px). Displays in discovery."
            />
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            {saved && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Profile updated successfully
              </span>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                disabled={saving}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

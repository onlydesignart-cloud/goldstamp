'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import { DynamicQrGenerator } from '../../../components/DynamicQrGenerator';
import { QrCode, Building2, ShieldCheck, RefreshCw } from 'lucide-react';

export default function ClientQrPage() {
  const { business } = useAuth();
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

  useEffect(() => {
    async function loadBranches() {
      if (!business) return;
      try {
        const res = await api.getBranches(business.id);
        if (res.success && res.data) {
          setBranches(res.data);
          if (res.data.length > 0) {
            setSelectedBranchId(res.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load branches:', err);
      }
    }
    loadBranches();
  }, [business]);

  const targetBusiness = business || { id: 'biz_smashzone', name: 'SmashZone Pickleball Arena' };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dynamic Check-In Kiosk</h1>
          <p className="text-xs text-slate-500 mt-1">
            Display this on a tablet, standee, or counter screen. Automatically rotates secure HMAC tokens every 60 seconds to prevent replay attacks.
          </p>
        </div>

        {branches.length > 0 && (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
            >
              <option value="">All Branches / Main</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex justify-center py-4">
        <DynamicQrGenerator
          businessId={targetBusiness.id}
          businessName={targetBusiness.name}
          branchId={selectedBranchId || null}
        />
      </div>
    </div>
  );
}

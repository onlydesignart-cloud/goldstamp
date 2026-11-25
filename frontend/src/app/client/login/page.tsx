'use client';

import React, { Suspense } from 'react';
import { MerchantAuthView } from '../../../components/MerchantAuthView';

export default function MerchantLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
          Loading merchant console...
        </div>
      }
    >
      <MerchantAuthView initialMode="login" />
    </Suspense>
  );
}

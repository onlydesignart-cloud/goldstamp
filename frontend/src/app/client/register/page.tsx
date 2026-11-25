'use client';

import React, { Suspense } from 'react';
import { MerchantAuthView } from '../../../components/MerchantAuthView';

export default function MerchantRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
          Loading merchant registration...
        </div>
      }
    >
      <MerchantAuthView initialMode="register" />
    </Suspense>
  );
}

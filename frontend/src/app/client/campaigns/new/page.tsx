'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCampaignRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/client/campaigns/create');
  }, [router]);

  return (
    <div className="p-8 text-center text-xs text-slate-400">
      Redirecting to campaign wizard...
    </div>
  );
}

// GoldStamp Mobile Customer API & Live Supabase Database Sync Service
import { LoyaltyCard, RewardVoucher, Business, ScanResult, Campaign } from '../types';

const SUPABASE_URL = 'https://grflhnwrjanxditvjimq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3xuZUMOSks6MVtFf2z4y5g_cTm3ZkNe';

// Active session customer state
let currentCustomer = {
  id: 'usr_cust_mobile_live',
  name: 'Arjun Mehta',
  phone: '8160587315',
  email: 'customer@goldstamp.app',
};

// In-memory state for user wallet passes and vouchers
let activeCards: LoyaltyCard[] = [];
let activeVouchers: RewardVoucher[] = [];
let cachedBusinesses: Business[] = [];
let inMemoryJoinedCampaignIds: string[] = [];

const getStorageKey = () => `goldstamp_joined_campaigns_${currentCustomer.id}`;

const loadJoinedCampaignIds = (): string[] => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(getStorageKey());
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch {}
  return inMemoryJoinedCampaignIds;
};

const saveJoinedCampaignIds = (ids: string[]) => {
  inMemoryJoinedCampaignIds = ids;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(getStorageKey(), JSON.stringify(ids));
    }
  } catch {}
};

export const CustomerApi = {
  // Set active customer profile on login
  setCurrentCustomer: (user: { name: string; phone: string; email?: string }) => {
    currentCustomer = {
      id: `usr_${user.phone.replace(/[^0-9]/g, '')}`,
      name: user.name,
      phone: user.phone,
      email: user.email || `${user.phone}@goldstamp.app`,
    };
  },

  getCurrentCustomer: () => currentCustomer,

  // Check if a specific campaign has been joined by this customer
  isCampaignJoined: (campaignId: string): boolean => {
    return loadJoinedCampaignIds().includes(campaignId);
  },

  // Get list of joined campaign IDs
  getJoinedCampaignIds: (): string[] => {
    return loadJoinedCampaignIds();
  },

  // Get all customer loyalty cards (strictly for joined campaigns)
  getCards: async (): Promise<LoyaltyCard[]> => {
    const joinedIds = loadJoinedCampaignIds();
    if (joinedIds.length === 0) {
      activeCards = [];
      return [];
    }

    try {
      // 1. Fetch businesses with their campaigns from Supabase
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/Business?select=*,industry:Industry(*),campaigns:Campaign(*,rules:CampaignRule(*),rewards:Reward(*))&status=eq.ACTIVE`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      // 2. Fetch CustomerBusiness stats to get accurate stamp & visit counts
      const cbRes = await fetch(
        `${SUPABASE_URL}/rest/v1/CustomerBusiness?userId=eq.${currentCustomer.id}&select=*`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      const cbMap: Record<string, any> = {};
      if (cbRes.ok) {
        const cbRows = await cbRes.json();
        if (Array.isArray(cbRows)) {
          cbRows.forEach((r: any) => {
            cbMap[r.businessId] = r;
          });
        }
      }

      if (res.ok) {
        const rawBusinesses = await res.json();
        if (Array.isArray(rawBusinesses)) {
          const cards: LoyaltyCard[] = [];

          for (const b of rawBusinesses) {
            const cb = cbMap[b.id];
            const bizTotalStamps = Number(cb?.totalStamps) || 0;
            const bizTotalVisits = Number(cb?.totalVisits) || 0;
            const lastVisitAt = cb?.lastVisitAt;

            for (const c of b.campaigns || []) {
              if (joinedIds.includes(c.id)) {
                const rule = c.rules?.[0];
                const reward = c.rewards?.[0];
                const targetStamps = Number(rule?.conditionValue) || 5;
                const rewardTitle = rule?.rewardValue || reward?.title || 'Milestone Reward';
                const currentCycleStamps = bizTotalStamps % targetStamps;

                cards.push({
                  id: `card_${c.id}`,
                  businessId: b.id,
                  campaignId: c.id,
                  businessName: b.name || 'Merchant Venue',
                  businessSlug: b.slug || 'venue',
                  businessLogo: b.logo,
                  bannerImage: c.bannerImage,
                  industry: b.industry?.name || 'Local Venue',
                  campaignName: c.name || 'Loyalty Pass',
                  rewardTitle,
                  currentStamps: currentCycleStamps,
                  targetStamps,
                  totalVisits: bizTotalVisits,
                  lastVisitAt,
                });
              }
            }
          }

          activeCards = cards;
          return cards;
        }
      }
    } catch (err) {
      console.warn('Failed to sync cards from Supabase:', err);
    }
    return [...activeCards];
  },

  // Get active and redeemed reward vouchers
  getVouchers: async (): Promise<RewardVoucher[]> => {
    return [...activeVouchers];
  },

  // Redeem a reward voucher
  redeemVoucher: async (voucherId: string): Promise<boolean> => {
    const v = activeVouchers.find((item) => item.id === voucherId);
    if (v) {
      v.status = 'REDEEMED';
    }
    return true;
  },

  // Get real registered venues from live Supabase Database
  getVenues: async (category?: string, query?: string): Promise<Business[]> => {
    try {
      let url = `${SUPABASE_URL}/rest/v1/Business?select=*,industry:Industry(*),campaigns:Campaign(*,rules:CampaignRule(*),rewards:Reward(*))&status=eq.ACTIVE`;
      if (query && query.trim()) {
        url += `&name=ilike.*${encodeURIComponent(query.trim())}*`;
      }

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const rawBusinesses = await res.json();
        if (Array.isArray(rawBusinesses)) {
          cachedBusinesses = rawBusinesses.map((b: any) => {
            const formattedCampaigns: Campaign[] = (b.campaigns || []).map((c: any) => {
              const rule = c.rules?.[0];
              const reward = c.rewards?.[0];
              const targetStamps = Number(rule?.conditionValue) || 5;
              const rewardTitle = rule?.rewardValue || reward?.title || 'Milestone Reward';

              return {
                id: c.id,
                businessId: b.id,
                name: c.name || 'Loyalty Pass',
                description: c.description || '',
                bannerImage: c.bannerImage,
                type: (c.type === 'VISIT' ? 'VISIT' : 'STAMP') as 'STAMP' | 'VISIT',
                targetStamps,
                rewardTitle,
              };
            });

            return {
              id: b.id,
              name: b.name,
              slug: b.slug,
              logo: b.logo,
              coverImage: b.coverImage,
              industry: b.industry?.name || 'Local Venue',
              city: b.city || '',
              address: b.address || '',
              campaigns: formattedCampaigns,
            };
          });

          let filtered = [...cachedBusinesses];
          if (category && category !== 'All') {
            filtered = filtered.filter((b) =>
              b.industry.toLowerCase().includes(category.toLowerCase())
            );
          }
          return filtered;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch live venues from Supabase:', err);
    }

    let filtered = [...cachedBusinesses];
    if (category && category !== 'All') {
      filtered = filtered.filter((b) =>
        b.industry.toLowerCase().includes(category.toLowerCase())
      );
    }
    return filtered;
  },

  // Scan Real Counter QR Token with direct Supabase Database Persistence
  scanQr: async (qrToken: string): Promise<ScanResult> => {
    const cleanToken = qrToken.trim();
    if (!cleanToken) {
      return {
        success: false,
        message: 'Invalid QR code. Please scan a fresh counter code.',
      };
    }

    try {
      // 1. Ensure Customer exists in Supabase User table
      await fetch(`${SUPABASE_URL}/rest/v1/User`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          id: currentCustomer.id,
          name: currentCustomer.name,
          phone: currentCustomer.phone,
          email: currentCustomer.email,
          role: 'CUSTOMER',
          status: 'ACTIVE',
          updatedAt: new Date().toISOString(),
        }),
      });

      // 2. Query Supabase for the QR token
      const qrRes = await fetch(
        `${SUPABASE_URL}/rest/v1/QRCode?token=eq.${encodeURIComponent(cleanToken)}&order=createdAt.desc&limit=1`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      let targetBizId = '';
      let targetCampId: string | null = null;
      let qrRecordId: string | null = null;

      if (qrRes.ok) {
        const qrRows = await qrRes.json();
        if (Array.isArray(qrRows) && qrRows.length > 0) {
          const qr = qrRows[0];
          if (qr.isUsed) {
            return {
              success: false,
              message: 'This counter QR code has already been consumed. Please scan the current rotating QR code.',
            };
          }
          targetBizId = qr.businessId;
          targetCampId = qr.campaignId;
          qrRecordId = qr.id;
        }
      }

      // If token not found in DB directly, fall back to matching user's active business card
      if (!targetBizId) {
        const card = activeCards[0];
        if (card) {
          targetBizId = card.businessId;
        } else if (cachedBusinesses.length > 0) {
          targetBizId = cachedBusinesses[0].id;
        }
      }

      if (!targetBizId) {
        return {
          success: false,
          message: 'Unable to match counter token with any active venue. Please join a campaign first.',
        };
      }

      // 3. Resolve Business details
      const bizRes = await fetch(
        `${SUPABASE_URL}/rest/v1/Business?id=eq.${targetBizId}&select=*,campaigns:Campaign(*,rules:CampaignRule(*),rewards:Reward(*))&limit=1`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      let businessName = 'Venue';
      let targetStamps = 5;
      let rewardTitle = 'Milestone Reward';
      let campaignName = 'Loyalty Pass';
      let bannerImage: string | undefined;

      if (bizRes.ok) {
        const bRows = await bizRes.json();
        if (Array.isArray(bRows) && bRows.length > 0) {
          const b = bRows[0];
          businessName = b.name;
          const matchedCamp = (b.campaigns || []).find((c: any) => c.id === targetCampId) || b.campaigns?.[0];
          if (matchedCamp) {
            targetCampId = matchedCamp.id;
            campaignName = matchedCamp.name;
            bannerImage = matchedCamp.bannerImage;
            const rule = matchedCamp.rules?.[0];
            targetStamps = Number(rule?.conditionValue) || 5;
            rewardTitle = rule?.rewardValue || 'Milestone Reward';
          }
        }
      }

      // Auto-join this campaign if not already joined
      if (targetCampId) {
        const joinedIds = loadJoinedCampaignIds();
        if (!joinedIds.includes(targetCampId)) {
          joinedIds.push(targetCampId);
          saveJoinedCampaignIds(joinedIds);
        }
      }

      // 4. Burn the token in Supabase
      if (qrRecordId) {
        await fetch(`${SUPABASE_URL}/rest/v1/QRCode?id=eq.${qrRecordId}`, {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isUsed: true }),
        });
      }

      const now = new Date().toISOString();
      const visitId = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const stampId = `st_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      // 5. Insert Visit into Supabase Visit Table
      await fetch(`${SUPABASE_URL}/rest/v1/Visit`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: visitId,
          userId: currentCustomer.id,
          businessId: targetBizId,
          campaignId: targetCampId,
          verificationMethod: 'QR',
          createdAt: now,
        }),
      });

      // 6. Insert StampTransaction into Supabase StampTransaction Table
      await fetch(`${SUPABASE_URL}/rest/v1/StampTransaction`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: stampId,
          userId: currentCustomer.id,
          businessId: targetBizId,
          campaignId: targetCampId,
          stamps: 1,
          type: 'EARNED',
          visitId: visitId,
          verificationMethod: 'QR',
          createdAt: now,
        }),
      });

      // 7. Upsert CustomerBusiness stats in Supabase
      const cbRes = await fetch(
        `${SUPABASE_URL}/rest/v1/CustomerBusiness?userId=eq.${currentCustomer.id}&businessId=eq.${targetBizId}&limit=1`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      let prevStamps = 0;
      let prevVisits = 0;
      let cbId = `cb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      if (cbRes.ok) {
        const cbRows = await cbRes.json();
        if (Array.isArray(cbRows) && cbRows.length > 0) {
          prevStamps = Number(cbRows[0].totalStamps) || 0;
          prevVisits = Number(cbRows[0].totalVisits) || 0;
          cbId = cbRows[0].id;
        }
      }

      const updatedStamps = prevStamps + 1;
      const updatedVisits = prevVisits + 1;

      await fetch(`${SUPABASE_URL}/rest/v1/CustomerBusiness`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          id: cbId,
          userId: currentCustomer.id,
          businessId: targetBizId,
          status: 'ACTIVE',
          totalVisits: updatedVisits,
          totalStamps: updatedStamps,
          lastVisitAt: now,
        }),
      });

      // 8. Update in-memory wallet cards & vouchers
      let card = activeCards.find((c) => c.campaignId === targetCampId) || activeCards.find((c) => c.businessId === targetBizId);
      if (!card) {
        card = {
          id: `card_${targetCampId || targetBizId}`,
          businessId: targetBizId,
          campaignId: targetCampId || undefined,
          businessName,
          businessSlug: 'venue',
          bannerImage,
          industry: 'Local Venue',
          campaignName,
          rewardTitle,
          currentStamps: 0,
          targetStamps,
          totalVisits: 0,
        };
        activeCards.push(card);
      }

      card.totalVisits = updatedVisits;
      card.currentStamps = updatedStamps % targetStamps;
      card.lastVisitAt = now;

      let rewardUnlocked = false;
      if (updatedStamps > 0 && updatedStamps % targetStamps === 0) {
        rewardUnlocked = true;
        const newVoucher: RewardVoucher = {
          id: `vch_${Date.now()}`,
          businessId: targetBizId,
          businessName,
          title: rewardTitle,
          description: `Reward unlocked for completing ${targetStamps} visits at ${businessName}!`,
          code: `GS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          status: 'AVAILABLE',
          unlockedAt: now,
        };
        activeVouchers.unshift(newVoucher);
      }

      return {
        success: true,
        businessName,
        stampsAwarded: 1,
        currentStamps: card.currentStamps,
        targetStamps: card.targetStamps,
        rewardUnlocked,
        rewardTitle: rewardUnlocked ? rewardTitle : undefined,
        message: rewardUnlocked
          ? `🎉 Congratulations! You have completed your stamp card at ${businessName} and unlocked your reward: ${rewardTitle}!`
          : `✅ Check-in recorded at ${businessName}! 1 stamp added to your wallet card.`,
      };
    } catch (err: any) {
      console.error('Scan QR process error:', err);
      return {
        success: false,
        message: err.message || 'An error occurred while recording your check-in. Please try again.',
      };
    }
  },

  // Join a specific Campaign Pass - adds this specific campaign card to customer's wallet
  joinCampaign: async (businessId: string, campaignId: string): Promise<boolean> => {
    // 1. Save campaign to customer's joined list
    const joinedIds = loadJoinedCampaignIds();
    if (!joinedIds.includes(campaignId)) {
      joinedIds.push(campaignId);
      saveJoinedCampaignIds(joinedIds);
    }

    try {
      // 2. Ensure User exists in Supabase
      await fetch(`${SUPABASE_URL}/rest/v1/User`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          id: currentCustomer.id,
          name: currentCustomer.name,
          phone: currentCustomer.phone,
          email: currentCustomer.email,
          role: 'CUSTOMER',
          status: 'ACTIVE',
          updatedAt: new Date().toISOString(),
        }),
      });

      // 3. Ensure CustomerBusiness exists in Supabase
      const cbId = `cb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await fetch(`${SUPABASE_URL}/rest/v1/CustomerBusiness`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          id: cbId,
          userId: currentCustomer.id,
          businessId,
          status: 'ACTIVE',
          totalVisits: 0,
          totalStamps: 0,
          joinedAt: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.warn('Supabase joinCampaign error:', err);
    }

    // 4. Refresh wallet cards
    await CustomerApi.getCards();
    return true;
  },

  // Backwards compatibility helper
  joinVenue: async (businessId: string): Promise<boolean> => {
    const biz = cachedBusinesses.find((b) => b.id === businessId);
    const primaryCamp = biz?.campaigns?.[0];
    if (primaryCamp) {
      return CustomerApi.joinCampaign(businessId, primaryCamp.id);
    }
    return true;
  },
};

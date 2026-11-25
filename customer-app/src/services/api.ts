// GoldStamp Mobile Customer API & Live Supabase Database Sync Service
import { LoyaltyCard, RewardVoucher, Business, ScanResult, Campaign } from '../types';

const SUPABASE_URL = 'https://grflhnwrjanxditvjimq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3xuZUMOSks6MVtFf2z4y5g_cTm3ZkNe';

// In-memory state for user wallet passes and vouchers
let activeCards: LoyaltyCard[] = [];
let activeVouchers: RewardVoucher[] = [];
let cachedBusinesses: Business[] = [];

export const CustomerApi = {
  // Get all customer loyalty cards (Live user cards)
  getCards: async (): Promise<LoyaltyCard[]> => {
    return new Promise((resolve) => {
      resolve([...activeCards]);
    });
  },

  // Get active and redeemed reward vouchers
  getVouchers: async (): Promise<RewardVoucher[]> => {
    return new Promise((resolve) => {
      resolve([...activeVouchers]);
    });
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

  // Scan Counter QR Token
  scanQr: async (qrToken: string): Promise<ScanResult> => {
    return new Promise((resolve) => {
      // Find the card to stamp
      const card = activeCards[0];
      if (!card) {
        resolve({
          success: false,
          message: 'No active stamp cards in your wallet. Please join a venue first.',
        });
        return;
      }

      const nextStamps = card.currentStamps + 1;
      card.currentStamps = nextStamps;
      card.totalVisits += 1;
      card.lastVisitAt = new Date().toISOString();

      let rewardUnlocked = false;
      if (nextStamps >= card.targetStamps) {
        rewardUnlocked = true;
        const newVoucher: RewardVoucher = {
          id: `vch_${Date.now()}`,
          businessId: card.businessId,
          businessName: card.businessName,
          title: card.rewardTitle,
          description: `Unlocked by completing ${card.targetStamps} visits milestone!`,
          code: `${card.businessName.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'AVAILABLE',
          unlockedAt: new Date().toISOString(),
        };
        activeVouchers.unshift(newVoucher);
        card.currentStamps = 0; // reset cycle
      }

      resolve({
        success: true,
        message: rewardUnlocked ? 'Milestone Reward Unlocked!' : 'Stamp Collected Successfully!',
        businessName: card.businessName,
        stampsAwarded: 1,
        currentStamps: card.currentStamps,
        targetStamps: card.targetStamps,
        rewardUnlocked,
        rewardTitle: card.rewardTitle,
      });
    });
  },

  // Redeem voucher
  redeemVoucher: async (voucherId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const v = activeVouchers.find((x) => x.id === voucherId);
      if (v) {
        v.status = 'REDEEMED';
        v.redeemedAt = new Date().toISOString();
      }
      resolve(true);
    });
  },

  // Join Venue Pass - Add real venue card to customer's wallet
  joinVenue: async (businessId: string): Promise<boolean> => {
    const biz = cachedBusinesses.find((b) => b.id === businessId);
    if (biz && !activeCards.some((c) => c.businessId === businessId)) {
      const primaryCamp = biz.campaigns?.[0];
      activeCards.push({
        id: `card_${biz.slug || biz.id}`,
        businessId: biz.id,
        businessName: biz.name,
        businessSlug: biz.slug,
        businessLogo: biz.logo,
        industry: biz.industry,
        campaignName: primaryCamp?.name || 'Loyalty Pass',
        rewardTitle: primaryCamp?.rewardTitle || 'Milestone Reward',
        currentStamps: 0,
        targetStamps: primaryCamp?.targetStamps || 5,
        totalVisits: 0,
      });
    }
    return true;
  },
};

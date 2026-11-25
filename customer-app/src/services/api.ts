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

  // Get all customer loyalty cards (Sync with Supabase CustomerBusiness)
  getCards: async (): Promise<LoyaltyCard[]> => {
    try {
      // Fetch user's joined business passes from live Supabase DB
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/CustomerBusiness?userId=eq.${currentCustomer.id}&select=*,business:Business(*,industry:Industry(*),campaigns:Campaign(*,rules:CampaignRule(*),rewards:Reward(*)))`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          activeCards = rows.map((row: any) => {
            const biz = row.business || {};
            const camp = biz.campaigns?.[0] || {};
            const rule = camp.rules?.[0];
            const targetStamps = Number(rule?.conditionValue) || 5;
            const rewardTitle = rule?.rewardValue || 'Milestone Reward';
            const totalStamps = Number(row.totalStamps) || 0;
            const currentCycleStamps = totalStamps % targetStamps;

            return {
              id: `card_${biz.slug || biz.id}`,
              businessId: biz.id,
              businessName: biz.name || 'Merchant Venue',
              businessSlug: biz.slug || 'venue',
              businessLogo: biz.logo,
              industry: biz.industry?.name || 'Local Venue',
              campaignName: camp.name || 'Loyalty Pass',
              rewardTitle,
              currentStamps: currentCycleStamps,
              targetStamps,
              totalVisits: Number(row.totalVisits) || 0,
              lastVisitAt: row.lastVisitAt,
            };
          });
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
          message: 'Unable to match counter token with any active venue. Please join a venue first.',
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

      if (bizRes.ok) {
        const bRows = await bizRes.json();
        if (Array.isArray(bRows) && bRows.length > 0) {
          const b = bRows[0];
          businessName = b.name;
          const camp = b.campaigns?.[0];
          if (camp) {
            targetCampId = camp.id;
            const rule = camp.rules?.[0];
            targetStamps = Number(rule?.conditionValue) || 5;
            rewardTitle = rule?.rewardValue || 'Milestone Reward';
          }
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
          deviceInfo: 'Customer Mobile App',
          createdAt: now,
        }),
      });

      // 6. Insert StampTransaction into Supabase
      if (targetCampId) {
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
            visitId: visitId,
            verificationMethod: 'QR',
            createdAt: now,
          }),
        });
      }

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
      let card = activeCards.find((c) => c.businessId === targetBizId);
      if (!card) {
        card = {
          id: `card_${targetBizId}`,
          businessId: targetBizId,
          businessName,
          businessSlug: 'venue',
          industry: 'Local Venue',
          campaignName: 'Loyalty Pass',
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
          description: `Unlocked by completing ${targetStamps} visits milestone!`,
          code: `${businessName.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'AVAILABLE',
          unlockedAt: now,
        };
        activeVouchers.unshift(newVoucher);
      }

      return {
        success: true,
        message: rewardUnlocked ? 'Milestone Reward Unlocked!' : 'Stamp Collected Successfully!',
        businessName,
        stampsAwarded: 1,
        currentStamps: card.currentStamps,
        targetStamps: card.targetStamps,
        rewardUnlocked,
        rewardTitle,
      };
    } catch (err: any) {
      console.error('Scan error:', err);
      return {
        success: false,
        message: err.message || 'An error occurred while validating counter code.',
      };
    }
  },

  // Redeem voucher
  redeemVoucher: async (voucherId: string): Promise<boolean> => {
    const v = activeVouchers.find((x) => x.id === voucherId);
    if (v) {
      v.status = 'REDEEMED';
      v.redeemedAt = new Date().toISOString();
    }
    return true;
  },

  // Join Venue Pass - Add real venue card to customer's wallet and write into live Supabase DB
  joinVenue: async (businessId: string): Promise<boolean> => {
    try {
      // 1. Ensure User exists in Supabase
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

      // 2. Insert into Supabase CustomerBusiness
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
      console.warn('Supabase joinVenue error:', err);
    }

    // 3. Update local state
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

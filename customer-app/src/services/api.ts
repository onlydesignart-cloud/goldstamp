// GoldStamp Mobile Customer API & Local Sync Service
import { LoyaltyCard, RewardVoucher, Business, ScanResult } from '../types';

// Seed Initial Customer Wallet Cards
let mockCards: LoyaltyCard[] = [
  {
    id: 'card_smashzone',
    businessId: 'biz_smashzone',
    businessName: 'SmashZone Arena',
    businessSlug: 'smashzone-pickleball',
    industry: 'Pickleball & Padel',
    campaignName: 'SmashZone Loyalty Loop',
    rewardTitle: '1 Hour FREE Court Session',
    currentStamps: 7,
    targetStamps: 10,
    totalVisits: 17,
    lastVisitAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'card_artisan',
    businessId: 'biz_cafeartisan',
    businessName: 'Artisan Roastery',
    businessSlug: 'artisan-roastery-cafe',
    industry: 'Cafés & Bakeries',
    campaignName: 'Daily Brew Pass',
    rewardTitle: 'Free Pour-Over Coffee',
    currentStamps: 4,
    targetStamps: 5,
    totalVisits: 9,
    lastVisitAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'card_powerbox',
    businessId: 'biz_powerbox',
    businessName: 'PowerBox Arena',
    businessSlug: 'powerbox-cricket-arena',
    industry: 'Box Cricket & Turf',
    campaignName: 'Championship Turf Pass',
    rewardTitle: '₹500 Arena Credit Voucher',
    currentStamps: 2,
    targetStamps: 5,
    totalVisits: 4,
    lastVisitAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'card_aurora',
    businessId: 'biz_aurora',
    businessName: 'Aurora Boutique Spa',
    businessSlug: 'aurora-boutique-spa',
    industry: 'Salons & Spas',
    campaignName: 'VIP Wellness Club',
    rewardTitle: 'Deluxe Styling & Treatment',
    currentStamps: 3,
    targetStamps: 4,
    totalVisits: 3,
    lastVisitAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
];

let mockVouchers: RewardVoucher[] = [
  {
    id: 'vch_001',
    businessId: 'biz_cafeartisan',
    businessName: 'Artisan Roastery',
    title: 'Free Specialty Pour-Over Coffee',
    description: 'Complimentary single-origin Ethiopian or signature iced latte at counter.',
    code: 'BREW-9482',
    status: 'AVAILABLE',
    unlockedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'vch_002',
    businessId: 'biz_smashzone',
    businessName: 'SmashZone Arena',
    title: '1 Hour FREE Pickleball Court',
    description: 'Full court booking on any weekday slot.',
    code: 'SMASH-2910',
    status: 'REDEEMED',
    unlockedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    redeemedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

let mockBusinesses: Business[] = [
  {
    id: 'biz_smashzone',
    name: 'SmashZone Arena',
    slug: 'smashzone-pickleball',
    industry: 'Pickleball & Padel',
    city: 'Sports Complex',
    campaigns: [
      {
        id: 'cmp_1',
        businessId: 'biz_smashzone',
        name: 'SmashZone Loyalty Loop',
        description: 'Play 10 Hours → Get 1 Hour FREE Court Session',
        type: 'VISIT',
        targetStamps: 10,
        rewardTitle: '1 Hour FREE Court Session',
      },
      {
        id: 'cmp_2',
        businessId: 'biz_smashzone',
        name: 'Weekend Rally Pass',
        description: '5 Weekend visits → Free Pro Grip & Energy Drink',
        type: 'VISIT',
        targetStamps: 5,
        rewardTitle: 'Free Pro Grip & Energy Drink',
      },
    ],
  },
  {
    id: 'biz_cafeartisan',
    name: 'Artisan Roastery',
    slug: 'artisan-roastery-cafe',
    industry: 'Cafés & Bakeries',
    city: 'Central Market',
    campaigns: [
      {
        id: 'cmp_3',
        businessId: 'biz_cafeartisan',
        name: 'Daily Brew Pass',
        description: '5 Coffees → Free Pour-Over',
        type: 'STAMP',
        targetStamps: 5,
        rewardTitle: 'Free Pour-Over Coffee',
      },
    ],
  },
  {
    id: 'biz_powerbox',
    name: 'PowerBox Arena',
    slug: 'powerbox-cricket-arena',
    industry: 'Box Cricket & Turf',
    city: 'Arena Turf Road',
    campaigns: [
      {
        id: 'cmp_4',
        businessId: 'biz_powerbox',
        name: 'Championship Turf Pass',
        description: '5 Matches → ₹500 Arena Credit',
        type: 'VISIT',
        targetStamps: 5,
        rewardTitle: '₹500 Arena Credit Voucher',
      },
    ],
  },
  {
    id: 'biz_aurora',
    name: 'Aurora Boutique Spa',
    slug: 'aurora-boutique-spa',
    industry: 'Salons & Spas',
    city: 'Wellness Arcade',
    campaigns: [
      {
        id: 'cmp_5',
        businessId: 'biz_aurora',
        name: 'VIP Wellness Club',
        description: '4 Visits → Deluxe Styling & Treatment',
        type: 'VISIT',
        targetStamps: 4,
        rewardTitle: 'Deluxe Styling & Treatment',
      },
    ],
  },
];

export const CustomerApi = {
  // Get all customer loyalty cards
  getCards: async (): Promise<LoyaltyCard[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockCards]), 200);
    });
  },

  // Get active and redeemed reward vouchers
  getVouchers: async (): Promise<RewardVoucher[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockVouchers]), 200);
    });
  },

  // Get nearby participating venues
  getVenues: async (category?: string, query?: string): Promise<Business[]> => {
    return new Promise((resolve) => {
      let filtered = [...mockBusinesses];
      if (category && category !== 'All') {
        filtered = filtered.filter((b) => b.industry.toLowerCase().includes(category.toLowerCase()));
      }
      if (query && query.trim()) {
        const q = query.toLowerCase();
        filtered = filtered.filter((b) => b.name.toLowerCase().includes(q) || b.city?.toLowerCase().includes(q));
      }
      setTimeout(() => resolve(filtered), 200);
    });
  },

  // Scan Counter QR Token
  scanQr: async (qrToken: string): Promise<ScanResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Find or pick a target card (simulating counter match)
        const card = mockCards[1] || mockCards[0]; // Artisan Roastery or SmashZone
        if (!card) {
          resolve({
            success: false,
            message: 'Unable to recognize counter QR token. Please scan directly at the counter kiosk.',
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
          // Generate new voucher!
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
          mockVouchers.unshift(newVoucher);
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
      }, 400);
    });
  },

  // Redeem voucher
  redeemVoucher: async (voucherId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const v = mockVouchers.find((x) => x.id === voucherId);
      if (v) {
        v.status = 'REDEEMED';
        v.redeemedAt = new Date().toISOString();
      }
      setTimeout(() => resolve(true), 300);
    });
  },

  // Join Venue Pass
  joinVenue: async (businessId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const biz = mockBusinesses.find((b) => b.id === businessId);
      if (biz && !mockCards.some((c) => c.businessId === businessId)) {
        const primaryCamp = biz.campaigns?.[0];
        mockCards.push({
          id: `card_${biz.slug}`,
          businessId: biz.id,
          businessName: biz.name,
          businessSlug: biz.slug,
          industry: biz.industry,
          campaignName: primaryCamp?.name || 'Loyalty Pass',
          rewardTitle: primaryCamp?.rewardTitle || 'Milestone Reward',
          currentStamps: 0,
          targetStamps: primaryCamp?.targetStamps || 5,
          totalVisits: 0,
        });
      }
      setTimeout(() => resolve(true), 250);
    });
  },
};

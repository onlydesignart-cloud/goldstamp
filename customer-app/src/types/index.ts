// GoldStamp Customer Mobile App Types

export interface Business {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  coverImage?: string;
  industry: string;
  city?: string;
  address?: string;
  campaigns?: Campaign[];
}

export interface Campaign {
  id: string;
  businessId: string;
  name: string;
  description: string;
  bannerImage?: string;
  type: 'STAMP' | 'VISIT';
  targetStamps: number;
  rewardTitle: string;
}

export interface LoyaltyCard {
  id: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
  businessLogo?: string;
  industry: string;
  campaignName: string;
  rewardTitle: string;
  currentStamps: number;
  targetStamps: number;
  totalVisits: number;
  lastVisitAt?: string;
}

export interface RewardVoucher {
  id: string;
  businessId: string;
  businessName: string;
  businessLogo?: string;
  title: string;
  description: string;
  code: string;
  status: 'AVAILABLE' | 'REDEEMED' | 'EXPIRED';
  unlockedAt: string;
  redeemedAt?: string;
}

export interface ScanResult {
  success: boolean;
  message: string;
  businessName?: string;
  stampsAwarded?: number;
  currentStamps?: number;
  targetStamps?: number;
  rewardUnlocked?: boolean;
  rewardTitle?: string;
}

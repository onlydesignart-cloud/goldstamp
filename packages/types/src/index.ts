export type UserRole = 'SUPER_ADMIN' | 'BUSINESS_OWNER' | 'BUSINESS_STAFF' | 'CUSTOMER';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';

export type BusinessStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';

export type CampaignType = 'STAMP' | 'VISIT' | 'POINT' | 'SPEND' | 'REFERRAL';

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'EXPIRED';

export type VerificationMethod = 'QR' | 'STAFF' | 'MANUAL' | 'SYSTEM';

export type PointTransactionType = 'EARN' | 'REDEEM' | 'ADJUSTMENT' | 'EXPIRY' | 'BONUS';

export type RewardType = 
  | 'FREE_PRODUCT' 
  | 'FREE_SERVICE' 
  | 'DISCOUNT_PERCENTAGE' 
  | 'DISCOUNT_FIXED' 
  | 'VOUCHER' 
  | 'POINTS' 
  | 'FREE_SESSION' 
  | 'CUSTOM';

export type RewardStatus = 'AVAILABLE' | 'CLAIMED' | 'REDEEMED' | 'EXPIRED' | 'CANCELLED';

export type SubscriptionStatus = 'ACTIVE' | 'TRIAL' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'WHATSAPP' | 'PUSH';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface BusinessDTO {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  coverImage?: string | null;
  description?: string | null;
  industryId: string;
  industry?: {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
  };
  ownerId: string;
  owner?: UserDTO;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: BusinessStatus;
  subscriptionId?: string | null;
  cooldownMinutes: number;
  stats?: {
    totalCustomers: number;
    totalVisits: number;
    totalStamps: number;
    activeCampaigns: number;
  };
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CampaignDTO {
  id: string;
  businessId: string;
  business?: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
  };
  name: string;
  description?: string | null;
  type: CampaignType;
  status: CampaignStatus;
  startDate: string | Date;
  endDate?: string | Date | null;
  isRecurring: boolean;
  recurrenceType?: string | null;
  maxCompletions?: number | null;
  rules?: CampaignRuleDTO[];
  rewards?: RewardDTO[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CampaignRuleDTO {
  id: string;
  campaignId: string;
  conditionType: 'VISIT_COUNT' | 'STAMP_COUNT' | 'POINT_BALANCE' | 'SPEND_AMOUNT' | 'REFERRAL_COUNT';
  conditionValue: number;
  rewardType: RewardType;
  rewardValue: string | number;
}

export interface RewardDTO {
  id: string;
  businessId: string;
  campaignId?: string | null;
  title: string;
  description?: string | null;
  type: RewardType;
  value: string;
  validFrom: string | Date;
  validUntil?: string | Date | null;
  usageLimit?: number | null;
  status: string;
  createdAt: string | Date;
  business?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface CustomerBusinessDTO {
  id: string;
  userId: string;
  businessId: string;
  business?: BusinessDTO;
  joinedAt: string | Date;
  status: string;
  totalVisits: number;
  totalStamps: number;
  totalPoints: number;
  lastVisitAt?: string | Date | null;
  activeStampsInCurrentCycle?: number;
  currentMilestoneTarget?: number;
}

export interface VisitDTO {
  id: string;
  userId: string;
  businessId: string;
  branchId?: string | null;
  campaignId?: string | null;
  verificationMethod: VerificationMethod;
  verifiedBy?: string | null;
  deviceInfo?: string | null;
  ipAddress?: string | null;
  createdAt: string | Date;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  business?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface StampTransactionDTO {
  id: string;
  userId: string;
  businessId: string;
  campaignId: string;
  visitId?: string | null;
  issuedBy?: string | null;
  verificationMethod: VerificationMethod;
  createdAt: string | Date;
}

export interface PointTransactionDTO {
  id: string;
  userId: string;
  businessId: string;
  campaignId?: string | null;
  amount: number;
  type: PointTransactionType;
  referenceId?: string | null;
  description?: string | null;
  createdAt: string | Date;
}

export interface RewardRedemptionDTO {
  id: string;
  rewardId: string;
  userId: string;
  businessId: string;
  code: string;
  status: RewardStatus;
  claimedAt: string | Date;
  redeemedAt?: string | Date | null;
  verifiedBy?: string | null;
  reward?: RewardDTO;
  user?: UserDTO;
  business?: BusinessDTO;
}

export interface QRCodeData {
  token: string;
  businessId: string;
  branchId?: string | null;
  campaignId?: string | null;
  expiresAt: string | number;
  type: 'DYNAMIC_CHECKIN' | 'CUSTOMER_PASS';
  qrSvg?: string;
  checkInUrl: string;
}

export interface CheckInResultDTO {
  verified: boolean;
  visit: VisitDTO;
  stamp?: StampTransactionDTO | null;
  pointsEarned?: number;
  currentStamps: number;
  milestoneTarget: number;
  rewardUnlocked?: RewardRedemptionDTO | null;
  message: string;
}

export interface SubscriptionPlanDTO {
  id: string;
  name: string;
  code: string;
  price: number;
  currency: string;
  interval: 'MONTHLY' | 'YEARLY';
  maxStaff: number;
  maxBranches: number;
  maxCampaigns: number;
  maxCustomers: number;
  features: string[];
  isActive: boolean;
}

import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CUSTOMER', 'BUSINESS_OWNER']).default('CUSTOMER'),
  businessName: z.string().optional(),
  industryId: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const CreateBusinessSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  industryId: z.string().min(1, 'Industry is required'),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('India'),
  pincode: z.string().optional(),
  cooldownMinutes: z.number().int().min(0).max(1440).default(60),
});

export const UpdateBusinessSchema = CreateBusinessSchema.partial();

export const CreateCampaignSchema = z.object({
  name: z.string().min(3, 'Campaign name must be at least 3 characters'),
  description: z.string().optional(),
  type: z.enum(['STAMP', 'VISIT', 'POINT', 'SPEND', 'REFERRAL']).default('STAMP'),
  conditionType: z.enum(['VISIT_COUNT', 'STAMP_COUNT', 'POINT_BALANCE', 'SPEND_AMOUNT', 'REFERRAL_COUNT']).default('VISIT_COUNT'),
  conditionValue: z.number().int().positive('Condition value must be greater than 0'),
  rewardTitle: z.string().min(2, 'Reward title is required'),
  rewardType: z.enum([
    'FREE_PRODUCT',
    'FREE_SERVICE',
    'DISCOUNT_PERCENTAGE',
    'DISCOUNT_FIXED',
    'VOUCHER',
    'POINTS',
    'FREE_SESSION',
    'CUSTOM'
  ]).default('FREE_SERVICE'),
  rewardValue: z.string().min(1, 'Reward value is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
  isRecurring: z.boolean().default(true),
  recurrenceType: z.string().optional().nullable(),
  maxCompletions: z.number().int().positive().optional().nullable(),
});

export const CheckInSchema = z.object({
  token: z.string().min(1, 'QR Token is required'),
  deviceInfo: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const StaffCheckInSchema = z.object({
  customerPassToken: z.string().optional(),
  customerUserId: z.string().optional(),
  campaignId: z.string().optional(),
  branchId: z.string().optional(),
  verificationMethod: z.enum(['QR', 'STAFF', 'MANUAL']).default('STAFF'),
});

export const RedeemRewardSchema = z.object({
  rewardId: z.string().min(1, 'Reward ID is required'),
});

export const VerifyRedemptionSchema = z.object({
  code: z.string().min(4, 'Redemption code is required'),
});

export const CreateIndustrySchema = z.object({
  name: z.string().min(2, 'Industry name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required'),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const CreateStaffSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['BUSINESS_STAFF']).default('BUSINESS_STAFF'),
  branchId: z.string().optional(),
});

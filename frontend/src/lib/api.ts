import { mockStore } from './mockStore';
import { createClient } from '../utils/supabase/client';
import QRCode from 'qrcode';
import {
  sanitizeText,
  sanitizePhone,
  sanitizeEmail,
  sanitizeVoucherCode,
  safeJsonParse,
  checkClientRateLimit,
} from './security';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: any;
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://goldstamp.onrender.com';

// Helper to simulate instant async execution
const asyncWrap = async <T>(fn: () => T | Promise<T>, message: string = 'Success'): Promise<ApiResponse<T>> => {
  try {
    const data = await fn();
    return { success: true, data, message };
  } catch (err: any) {
    return {
      success: false,
      error: {
        code: 'OPERATION_ERROR',
        message: err.message || 'An error occurred during local testing operation',
      },
    };
  }
};

const getActiveUserId = (): string => {
  if (typeof window === 'undefined') return '';
  const path = window.location.pathname;
  if (path.startsWith('/client')) {
    const merchantUser = localStorage.getItem('goldstamp_merchant_user');
    const parsed = safeJsonParse<any>(merchantUser, null);
    return parsed?.id || '';
  }
  if (path.startsWith('/admin') || path.startsWith('/vault-master-gs-8821')) {
    const adminUser = localStorage.getItem('goldstamp_admin_user');
    const parsed = safeJsonParse<any>(adminUser, null);
    return parsed?.id || '';
  }
  const customerUser = localStorage.getItem('goldstamp_customer_user') || localStorage.getItem('goldstamp_user');
  const parsed = safeJsonParse<any>(customerUser, null);
  return parsed?.id || '';
};

export const api = {
  // --- Auth ---
  login: async (credentials: any): Promise<ApiResponse<any>> => {
    const email = sanitizeEmail(credentials.email);

    // Check if this merchant email is awaiting confirmation
    const pending = mockStore.getPendingVerificationByEmail(email);
    if (pending) {
      return {
        success: false,
        error: {
          code: 'EMAIL_NOT_VERIFIED',
          message: 'EMAIL_NOT_VERIFIED: Your account is pending email confirmation. Please click the activation link in your email to authenticate.',
        },
      };
    }

    // 1. Try real live backend API (PostgreSQL Supabase)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const { user, business, accessToken, refreshToken } = json.data;

        if (typeof window !== 'undefined') {
          const path = window.location.pathname;
          const isClient = path.startsWith('/client') || user.role === 'BUSINESS_OWNER' || user.role === 'BUSINESS_STAFF';
          const isAdmin = path.startsWith('/admin') || path.startsWith('/vault-master-gs-8821') || user.role === 'SUPER_ADMIN';

          if (isClient) {
            localStorage.setItem('goldstamp_merchant_token', accessToken);
            localStorage.setItem('goldstamp_merchant_user', JSON.stringify(user));
            if (business) {
              localStorage.setItem('goldstamp_merchant_business', JSON.stringify(business));
            }
          } else if (isAdmin) {
            localStorage.setItem('goldstamp_admin_token', accessToken);
            localStorage.setItem('goldstamp_admin_user', JSON.stringify(user));
          } else {
            localStorage.setItem('goldstamp_customer_token', accessToken);
            localStorage.setItem('goldstamp_customer_user', JSON.stringify(user));
          }
          localStorage.setItem('goldstamp_token', accessToken);
          if (refreshToken) {
            localStorage.setItem('goldstamp_refresh_token', refreshToken);
          }
        }

        mockStore.syncUser(user);
        if (business) mockStore.syncBusiness(business);

        return {
          success: true,
          data: {
            user,
            business,
            accessToken,
            refreshToken,
          },
          message: 'Login successful',
        };
      } else if (json.error?.code === 'INVALID_CREDENTIALS') {
        return {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password.',
          },
        };
      }
    } catch (netErr) {
      console.warn('Backend login network notice, falling back to local store:', netErr);
    }

    // 2. Local fallback
    return asyncWrap(() => {
      const user = mockStore.getUserByEmail(email);
      if (!user) throw new Error('Account with this email does not exist');
      
      const token = `jwt_${user.id}_${Date.now()}`;
      const business = (user.role === 'BUSINESS_OWNER' || user.role === 'BUSINESS_STAFF')
        ? mockStore.getBusinessByOwnerId(user.id)
        : null;

      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const isClient = path.startsWith('/client') || user.role === 'BUSINESS_OWNER' || user.role === 'BUSINESS_STAFF';
        const isAdmin = path.startsWith('/admin') || path.startsWith('/vault-master-gs-8821') || user.role === 'SUPER_ADMIN';

        if (isClient) {
          localStorage.setItem('goldstamp_merchant_token', token);
          localStorage.setItem('goldstamp_merchant_user', JSON.stringify(user));
          if (business) {
            localStorage.setItem('goldstamp_merchant_business', JSON.stringify(business));
          }
        } else if (isAdmin) {
          localStorage.setItem('goldstamp_admin_token', token);
          localStorage.setItem('goldstamp_admin_user', JSON.stringify(user));
        } else {
          localStorage.setItem('goldstamp_customer_token', token);
          localStorage.setItem('goldstamp_customer_user', JSON.stringify(user));
        }
        localStorage.setItem('goldstamp_token', token);
      }

      return {
        user,
        business,
        accessToken: token,
        refreshToken: `refresh_${user.id}`,
      };
    }, 'Login successful');
  },

  loginWithWhatsApp: async (phone: string, otp?: string): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const cleanPhone = sanitizePhone(phone);
      if (!cleanPhone || cleanPhone.replace(/[^0-9]/g, '').length < 8) {
        throw new Error('Please enter a valid 10-digit WhatsApp number');
      }

      let user = mockStore.getUserByPhone(cleanPhone);
      if (!user) {
        // Instant customer account creation for zero-friction loyalty enrollment
        const lastDigits = cleanPhone.slice(-4);
        user = mockStore.createUser({
          name: `Patron (${lastDigits})`,
          email: `wa_${cleanPhone.replace(/[^0-9]/g, '')}@whatsapp.goldstamp.io`,
          phone: cleanPhone,
          role: 'CUSTOMER',
          status: 'ACTIVE',
        });
      }

      const token = `mock_jwt_wa_${user.id}_${Date.now()}`;
      if (typeof window !== 'undefined') {
        localStorage.setItem('goldstamp_customer_token', token);
        localStorage.setItem('goldstamp_customer_user', JSON.stringify(user));
        localStorage.setItem('goldstamp_user', JSON.stringify(user));
        localStorage.setItem('goldstamp_token', token);
      }

      return {
        user,
        accessToken: token,
      };
    }, 'WhatsApp verified successfully');
  },

  loginWithGoogle: async (googleData?: { email?: string; name?: string; avatar?: string }): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const rawEmail = googleData?.email || 'customer.alex@gmail.com';
      const email = sanitizeEmail(rawEmail) || 'customer.alex@gmail.com';
      const name = sanitizeText(googleData?.name || 'Alex Morgan', 50);

      let user = mockStore.getUserByEmail(email);
      if (!user) {
        // Instant customer account creation with Google profile
        user = mockStore.createUser({
          name,
          email,
          phone: '',
          role: 'CUSTOMER',
          status: 'ACTIVE',
          avatar: googleData?.avatar || null,
        });
      }

      const token = `mock_jwt_google_${user.id}_${Date.now()}`;
      if (typeof window !== 'undefined') {
        localStorage.setItem('goldstamp_customer_token', token);
        localStorage.setItem('goldstamp_customer_user', JSON.stringify(user));
        localStorage.setItem('goldstamp_user', JSON.stringify(user));
        localStorage.setItem('goldstamp_token', token);
      }

      return {
        user,
        accessToken: token,
      };
    }, 'Signed in with Google successfully');
  },

  register: async (data: any): Promise<ApiResponse<any>> => {
    return asyncWrap(async () => {
      const isMerchant = data.role === 'BUSINESS_OWNER' || !!data.businessName;

      // 1. Send registration to live Render Backend (directly writing to Supabase User, Business, Subscription tables)
      let backendData: any = null;
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name || data.ownerName,
            email: data.email,
            phone: data.phone || '',
            password: data.password,
            role: isMerchant ? 'BUSINESS_OWNER' : 'CUSTOMER',
            businessName: isMerchant ? data.businessName : undefined,
          }),
        });

        const json = await res.json();
        if (res.ok && json.success && json.data) {
          backendData = json.data;
          if (backendData.user) mockStore.syncUser(backendData.user);
          if (backendData.business) mockStore.syncBusiness(backendData.business);
        } else if (json.error?.code === 'EMAIL_EXISTS' || json.message?.includes('already exists')) {
          throw new Error('An account with this email address is already registered.');
        }
      } catch (err: any) {
        if (err.message?.includes('already registered')) {
          throw err;
        }
        console.warn('Backend registration API note:', err);
      }

      if (isMerchant) {
        // Strict Merchant Email Confirmation: Do NOT save credentials to active session
        const pending = mockStore.createPendingMerchantRegistration({
          businessName: data.businessName,
          ownerName: data.name || data.ownerName,
          email: data.email,
          phone: data.phone,
          industry: data.industry,
          city: data.city,
          password: data.password,
        });

        // Trigger real confirmation email delivery via Supabase Auth
        if (typeof window !== 'undefined') {
          try {
            const supabase = createClient();
            const verifyUrl = `${window.location.origin}/client/verify-email?token=${pending.verificationToken}`;
            await supabase.auth.signUp({
              email: pending.email,
              password: data.password,
              options: {
                emailRedirectTo: verifyUrl,
                data: {
                  businessName: data.businessName,
                  ownerName: data.ownerName || data.name,
                  role: 'BUSINESS_OWNER',
                },
              },
            }).catch((err) => {
              console.warn('Supabase auth signup notice:', err);
            });
          } catch (err) {
            console.warn('Email dispatch service note:', err);
          }
        }

        return {
          pending: true,
          email: pending.email,
          verificationToken: pending.verificationToken,
          businessName: pending.businessName,
          backendBusiness: backendData?.business || null,
          message: 'Verification link dispatched to your email address.',
        };
      }

      const existing = mockStore.getUserByEmail(data.email);
      if (existing) throw new Error('Email is already registered');

      const user = backendData?.user || mockStore.createUser(data);
      const token = backendData?.accessToken || `mock_jwt_${user.id}_${Date.now()}`;

      if (typeof window !== 'undefined') {
        localStorage.setItem('goldstamp_customer_token', token);
        localStorage.setItem('goldstamp_customer_user', JSON.stringify(user));
        localStorage.setItem('goldstamp_user', JSON.stringify(user));
        localStorage.setItem('goldstamp_token', token);
      }

      return {
        user,
        accessToken: token,
      };
    }, 'Registration submitted');
  },

  verifyMerchantEmail: async (token: string): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      return mockStore.verifyMerchantEmail(token);
    }, 'Email confirmed and account activated');
  },

  resendMerchantVerification: async (email: string): Promise<ApiResponse<any>> => {
    return asyncWrap(async () => {
      const res = mockStore.resendMerchantVerificationEmail(email);

      // Resend real confirmation email via Supabase Auth
      if (typeof window !== 'undefined') {
        try {
          const supabase = createClient();
          const verifyUrl = `${window.location.origin}/client/verify-email?token=${res.verificationToken}`;
          await supabase.auth.resend({
            type: 'signup',
            email: res.email,
            options: {
              emailRedirectTo: verifyUrl,
            },
          }).catch((err) => {
            console.warn('Supabase auth resend notice:', err);
          });
        } catch (err) {
          console.warn('Email resend service note:', err);
        }
      }

      return res;
    }, 'Verification email resent');
  },

  requestPasswordReset: async (email: string): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      return mockStore.requestPasswordReset(email);
    }, 'Password reset link sent');
  },

  resetPassword: async (token: string, newPass: string): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      return mockStore.resetPassword(token, newPass);
    }, 'Password updated successfully');
  },

  getMe: async (): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      if (path.startsWith('/client')) {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('goldstamp_merchant_user') : null;
        if (!stored) return null;
        const parsed = safeJsonParse<any>(stored, null);
        if (!parsed) return null;
        const user = mockStore.getUserById(parsed.id) || mockStore.getUserByEmail(parsed.email);
        const business = user ? mockStore.getBusinessByOwnerId(user.id) : null;
        return {
          ...user,
          ownedBusinesses: business ? [business] : [],
        };
      }

      if (path.startsWith('/admin') || path.startsWith('/vault-master-gs-8821')) {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('goldstamp_admin_user') : null;
        if (!stored) return null;
        const parsed = safeJsonParse<any>(stored, null);
        if (!parsed) return null;
        const user = mockStore.getUserById(parsed.id) || mockStore.getUserByEmail(parsed.email);
        return {
          ...user,
          ownedBusinesses: [],
        };
      }

      // Customer route:
      const stored = typeof window !== 'undefined'
        ? (localStorage.getItem('goldstamp_customer_user') || localStorage.getItem('goldstamp_user'))
        : null;
      if (!stored) return null;
      const parsed = safeJsonParse<any>(stored, null);
      if (!parsed) return null;
      const user = mockStore.getUserById(parsed.id);
      return user || null;
    });
  },

  updateProfile: async (updates: { name?: string; phone?: string; email?: string }): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const activeUserId = getActiveUserId();
      const sanitizedUpdates: any = {};
      if (updates.name !== undefined) sanitizedUpdates.name = sanitizeText(updates.name, 60);
      if (updates.phone !== undefined) sanitizedUpdates.phone = sanitizePhone(updates.phone);
      if (updates.email !== undefined) sanitizedUpdates.email = sanitizeEmail(updates.email);

      const updatedUser = mockStore.updateUser(activeUserId, sanitizedUpdates);
      if (typeof window !== 'undefined') {
        localStorage.setItem('goldstamp_customer_user', JSON.stringify(updatedUser));
        localStorage.setItem('goldstamp_user', JSON.stringify(updatedUser));
      }
      return updatedUser;
    }, 'Profile updated successfully');
  },

  // --- Businesses ---
  getPublicBusinesses: async (paramsStr: string = ''): Promise<ApiResponse<any>> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/businesses${paramsStr ? `?${paramsStr}` : ''}`);
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        json.data.forEach((b: any) => mockStore.syncBusiness(b));
        return {
          success: true,
          data: json.data,
        };
      }
    } catch (e) {
      console.warn('Live backend fetch businesses note:', e);
    }

    return asyncWrap(() => {
      const params = new URLSearchParams(paramsStr);
      const industry = params.get('industry') || undefined;
      const search = params.get('search') || undefined;
      return mockStore.getBusinesses({ industry, search, status: 'ACTIVE' });
    });
  },

  getBusinessBySlug: async (slug: string): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const biz = mockStore.getBusinessBySlug(slug);
      if (!biz) throw new Error('Business venue not found');
      return biz;
    });
  },

  getMyBusiness: async (): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const userId = getActiveUserId();
      return mockStore.getBusinessByOwnerId(userId);
    });
  },

  updateBusiness: async (id: string, data: any): Promise<ApiResponse<any>> => {
    return asyncWrap(() => mockStore.updateBusiness(id, data), 'Business updated');
  },

  getBranches: async (businessId: string): Promise<ApiResponse<any>> => {
    return asyncWrap(() => [
      { id: 'br_main', businessId, name: 'Main Campus / Arena', city: 'Surat', phone: '+919900112233' }
    ]);
  },

  createBranch: async (businessId: string, data: any): Promise<ApiResponse<any>> => {
    return asyncWrap(() => ({ id: `br_${Date.now()}`, businessId, ...data }));
  },

  // --- Industries ---
  getIndustries: async (all = false): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const inds = mockStore.getRaw().industries;
      return all ? inds : inds.filter((i) => i.isActive);
    });
  },

  createIndustry: async (data: any): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const db = mockStore.getRaw();
      const newInd = { id: `ind_${Date.now()}`, slug: data.name.toLowerCase().replace(/[^a-z]/g, '-'), isActive: true, ...data };
      db.industries.push(newInd);
      return newInd;
    });
  },

  updateIndustry: async (id: string, data: any): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const db = mockStore.getRaw();
      const ind = db.industries.find((i) => i.id === id);
      if (ind) Object.assign(ind, data);
      return ind;
    });
  },

  toggleIndustry: async (id: string): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const db = mockStore.getRaw();
      const ind = db.industries.find((i) => i.id === id);
      if (ind) ind.isActive = !ind.isActive;
      return ind;
    });
  },

  // --- Campaigns ---
  getCampaigns: async (businessId: string): Promise<ApiResponse<any>> => {
    return asyncWrap(() => mockStore.getCampaignsByBusiness(businessId));
  },

  getCampaign: async (id: string): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const db = mockStore.getRaw();
      return db.campaigns.find((c) => c.id === id) || db.campaigns[0];
    });
  },

  createCampaign: async (businessId: string, data: any): Promise<ApiResponse<any>> => {
    return asyncWrap(() => mockStore.createCampaign(businessId, data), 'Campaign created successfully');
  },

  updateCampaignStatus: async (id: string, status: string): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const db = mockStore.getRaw();
      const cmp = db.campaigns.find((c) => c.id === id);
      if (cmp) cmp.status = status;
      return cmp;
    });
  },

  // --- Dynamic QR Kiosk Engine ---
  generateDynamicQr: async (businessId: string, options: any = {}): Promise<ApiResponse<any>> => {
    return asyncWrap(async () => {
      const tokenData = mockStore.generateQrToken(businessId, options.branchId);
      let qrDataUrl = '';
      try {
        qrDataUrl = await QRCode.toDataURL(tokenData.checkInUrl, {
          width: 320,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        });
      } catch (err) {
        console.error('Failed to generate QR code canvas:', err);
      }
      return {
        ...tokenData,
        qrDataUrl,
      };
    }, 'Dynamic QR generated');
  },

  getCustomerPass: async (): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const userId = getActiveUserId();
      const user = mockStore.getUserById(userId) || mockStore.getRaw().users[3];
      return {
        qrCode: `CUSTOMER_PASS_${user.id}`,
        token: `token_${user.id}`,
        user: { id: user.id, name: user.name, phone: user.phone },
      };
    });
  },

  // --- Check-In Engine (Atomic Milestone & Stamps) ---
  checkIn: async (data: { token: string; deviceInfo?: string }): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      if (!checkClientRateLimit('client_checkin', 1000)) {
        throw new Error('Please wait a moment before checking in again.');
      }
      let customerId: string | undefined;
      if (typeof window !== 'undefined') {
        const custStored = localStorage.getItem('goldstamp_customer_user') || localStorage.getItem('goldstamp_user');
        if (custStored) {
          const parsed = safeJsonParse<any>(custStored, null);
          if (parsed?.id) customerId = parsed.id;
        }
      }
      return mockStore.processCheckIn(data.token, customerId || 'usr_customer_alex');
    });
  },

  processCheckIn: async (payload: any): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      if (!checkClientRateLimit('client_checkin', 1000)) {
        throw new Error('Please wait a moment before checking in again.');
      }
      let customerId: string | undefined = payload?.customerId;
      if (!customerId && typeof window !== 'undefined') {
        const custStored = localStorage.getItem('goldstamp_customer_user') || localStorage.getItem('goldstamp_user');
        if (custStored) {
          const parsed = safeJsonParse<any>(custStored, null);
          if (parsed?.id) customerId = parsed.id;
        }
      }
      return mockStore.processCheckIn(payload, customerId || 'usr_customer_alex');
    });
  },

  staffCheckIn: async (businessId: string, data: any): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const customerUserId = data.customerUserId || 'usr_customer_alex';
      return mockStore.processCheckIn('mock_staff_pass', customerUserId);
    });
  },

  // --- Rewards & Redemptions ---
  getBusinessRewards: async (businessId: string): Promise<ApiResponse<any>> => {
    return asyncWrap(() => mockStore.getRaw().rewards.filter((r) => r.businessId === businessId));
  },

  getMyRewards: async (all = false): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const userId = getActiveUserId();
      return mockStore.getCustomerRedemptions(userId);
    });
  },

  claimReward: async (rewardId: string): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      if (!checkClientRateLimit(`claim_${rewardId}`, 2000)) {
        throw new Error('Reward claim in progress. Please wait a moment.');
      }
      let customerId: string | undefined;
      if (typeof window !== 'undefined') {
        const custStored = localStorage.getItem('goldstamp_customer_user') || localStorage.getItem('goldstamp_user');
        if (custStored) {
          const parsed = safeJsonParse<any>(custStored, null);
          if (parsed?.id) customerId = parsed.id;
        }
      }
      return mockStore.claimReward(customerId || 'usr_customer_alex', rewardId);
    }, 'Reward claimed');
  },

  getBusinessRedemptions: async (businessId: string): Promise<ApiResponse<any>> => {
    return asyncWrap(() => mockStore.getBusinessRedemptions(businessId));
  },

  verifyRedemption: async (businessId: string, code: string): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const cleanCode = sanitizeVoucherCode(code);
      return mockStore.verifyRedemption(businessId, cleanCode);
    }, 'Reward redeemed successfully');
  },

  // --- Customer Loyalty Wallet ---
  getMyLoyalty: async (): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const userId = getActiveUserId();
      return mockStore.getCustomerLoyalty(userId);
    });
  },

  joinProgram: async (businessId: string): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const userId = getActiveUserId();
      return mockStore.joinProgram(userId, businessId);
    }, 'Successfully joined loyalty program');
  },

  getMyVisits: async (): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const userId = getActiveUserId();
      const db = mockStore.getRaw();
      return db.visits.filter((v) => v.userId === userId).map((v) => {
        const biz = db.businesses.find((b) => b.id === v.businessId);
        return { ...v, business: biz };
      });
    });
  },

  getMyPoints: async (): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const userId = getActiveUserId();
      const loyalty = mockStore.getCustomerLoyalty(userId);
      const totalPoints = loyalty.reduce((acc, c) => acc + (c.totalPoints || 0), 0);
      return { totalPoints, programs: loyalty };
    });
  },

  getBusinessCustomers: async (businessId: string, query: string = ''): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const db = mockStore.getRaw();
      const links = db.customerBusinesses.filter((c) => c.businessId === businessId);
      return links.map((l) => {
        const user = db.users.find((u) => u.id === l.userId) || { name: 'Customer', email: 'guest@example.com' };
        
        // Find enrolled campaign from link, recent visit, or business active campaign
        const lastVisit = db.visits.find((v) => v.userId === l.userId && v.businessId === businessId);
        const campaignId = (l as any).campaignId || lastVisit?.campaignId;
        let campaign = db.campaigns.find((c) => c.id === campaignId);
        if (!campaign) {
          campaign = db.campaigns.find((c) => c.businessId === businessId);
        }

        return {
          id: l.id,
          user,
          campaign: campaign
            ? {
                id: campaign.id,
                name: campaign.name,
                type: campaign.type,
                rewardTitle: campaign.rewards?.[0]?.title || 'Loyalty Reward',
              }
            : null,
          totalVisits: l.totalVisits,
          totalStamps: l.totalStamps,
          totalPoints: l.totalPoints,
          lastVisitAt: l.lastVisitAt,
          joinedAt: l.joinedAt,
        };
      });
    });
  },

  // --- Staff Management ---
  getStaff: async (businessId: string): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const db = mockStore.getRaw();
      const staffList = db.staff.filter((s) => s.businessId === businessId);
      return staffList.map((s) => {
        const user = db.users.find((u) => u.id === s.userId) || {
          name: s.name,
          email: s.email,
          role: s.role || 'BUSINESS_STAFF',
          status: s.isActive ? 'ACTIVE' : 'SUSPENDED',
        };
        return {
          ...s,
          user,
        };
      });
    });
  },

  createStaff: async (businessId: string, data: any): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const db = mockStore.getRaw();
      const staffUserId = `usr_staff_${Date.now()}`;
      
      // 1. Create or link user record so staff can actually log in
      let existingUser = db.users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
      if (!existingUser) {
        existingUser = {
          id: staffUserId,
          name: data.name,
          email: data.email,
          role: 'BUSINESS_STAFF',
          status: 'ACTIVE',
          phone: data.phone || '+919876543210',
          createdAt: new Date().toISOString(),
        };
        db.users.push(existingUser);
      } else {
        existingUser.role = 'BUSINESS_STAFF';
        existingUser.status = 'ACTIVE';
      }

      // 2. Create staff record
      const newStaff = {
        id: `stf_${Date.now()}`,
        businessId,
        userId: existingUser.id,
        name: data.name,
        email: data.email,
        role: data.role || 'BUSINESS_STAFF',
        isActive: true,
        createdAt: new Date().toISOString(),
        user: existingUser,
      };

      if (!db.staff) db.staff = [];
      db.staff.push(newStaff);
      mockStore.saveDb(db);

      return newStaff;
    }, 'Staff account created successfully');
  },

  toggleStaff: async (businessId: string, staffId: string): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const db = mockStore.getRaw();
      const member = db.staff.find((s) => s.id === staffId);
      if (member) {
        member.isActive = !member.isActive;
        const u = db.users.find((u) => u.id === member.userId || u.email === member.email);
        if (u) {
          u.status = member.isActive ? 'ACTIVE' : 'SUSPENDED';
        }
        mockStore.saveDb(db);
      }
      return member;
    });
  },

  // --- Analytics & Visits ---
  getBusinessAnalytics: async (businessId: string): Promise<ApiResponse<any>> => {
    return asyncWrap(() => mockStore.getBusinessAnalytics(businessId));
  },

  getBusinessVisits: async (businessId: string): Promise<ApiResponse<any>> => {
    return asyncWrap(() => mockStore.getBusinessVisits(businessId));
  },

  getAdminAnalytics: async (): Promise<ApiResponse<any>> => {
    return asyncWrap(() => mockStore.getAdminDashboard());
  },

  getAdminPlatformAnalytics: async (): Promise<ApiResponse<any>> => {
    return asyncWrap(() => mockStore.getAdminPlatformAnalytics());
  },

  // --- Platform Admin ---
  getAdminBusinesses: async (query: string = ''): Promise<ApiResponse<any>> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/businesses${query ? `?search=${encodeURIComponent(query)}` : ''}`);
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        json.data.forEach((b: any) => mockStore.syncBusiness(b));
        return {
          success: true,
          data: json.data,
        };
      }
    } catch (e) {
      console.warn('Live backend getAdminBusinesses note:', e);
    }
    return asyncWrap(() => mockStore.getRaw().businesses);
  },

  getAdminBusinessDetail: async (id: string): Promise<ApiResponse<any>> => {
    return asyncWrap(() => mockStore.getRaw().businesses.find((b) => b.id === id));
  },

  updateAdminBusinessStatus: async (id: string, status: string): Promise<ApiResponse<any>> => {
    return asyncWrap(() => mockStore.updateBusinessStatus(id, status), `Business status updated to ${status}`);
  },

  getAdminUsers: async (query: string = ''): Promise<ApiResponse<any>> => {
    return asyncWrap(() => mockStore.getRaw().users);
  },

  updateAdminUserStatus: async (id: string, status: string): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const db = mockStore.getRaw();
      const u = db.users.find((x) => x.id === id);
      if (u) u.status = status;
      return u;
    });
  },

  getAdminAuditLogs: async (): Promise<ApiResponse<any>> => {
    return asyncWrap(() => [
      { id: 'aud_1', action: 'CHECKIN_VERIFIED', entityType: 'VISIT', actorRole: 'CUSTOMER', createdAt: new Date().toISOString() },
      { id: 'aud_2', action: 'REWARD_REDEEMED', entityType: 'REDEMPTION', actorRole: 'BUSINESS_STAFF', createdAt: new Date().toISOString() },
      { id: 'aud_3', action: 'CAMPAIGN_CREATED', entityType: 'CAMPAIGN', actorRole: 'BUSINESS_OWNER', createdAt: new Date().toISOString() },
    ]);
  },

  getAdminVisits: async (): Promise<ApiResponse<any>> => {
    return asyncWrap(() => mockStore.getRaw().visits);
  },

  getAdminVisitsEnriched: async (): Promise<ApiResponse<any>> => {
    return asyncWrap(() => mockStore.getAllVisitsEnriched());
  },

  getPlatformSettings: async (): Promise<ApiResponse<any>> => {
    return asyncWrap(() => mockStore.getPlatformSettings());
  },

  updatePlatformSettings: async (settings: any): Promise<ApiResponse<any>> => {
    return asyncWrap(() => mockStore.updatePlatformSettings(settings), 'Platform settings updated successfully');
  },

  resetPlatformData: async (): Promise<ApiResponse<any>> => {
    return asyncWrap(() => mockStore.resetToSeed(), 'Platform database reset to default demo seed');
  },

  getAdminRedemptions: async (): Promise<ApiResponse<any>> => {
    return asyncWrap(() => mockStore.getRaw().redemptions);
  },

  // --- Subscriptions ---
  getPlans: async (): Promise<ApiResponse<any>> => {
    return asyncWrap(() => mockStore.getRaw().plans);
  },

  getAdminSubscriptions: async (): Promise<ApiResponse<any>> => {
    return asyncWrap(() => mockStore.getAdminSubscriptions());
  },

  getSubscription: async (businessId: string): Promise<ApiResponse<any>> => {
    return asyncWrap(() => mockStore.getSubscription(businessId));
  },

  getInvoices: async (businessId: string): Promise<ApiResponse<any>> => {
    return asyncWrap(() => mockStore.getInvoices(businessId));
  },

  createCheckout: async (businessId: string, planId: string): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const plan = mockStore.getRaw().plans.find((p: any) => p.id === planId) || mockStore.getRaw().plans[1];
      return {
        orderId: `order_${Date.now()}`,
        amount: plan.price * 100,
        currency: 'INR',
        plan,
      };
    });
  },

  verifyPayment: async (data: any): Promise<ApiResponse<any>> => {
    return asyncWrap(() => {
      const res = mockStore.upgradeSubscription(data.businessId, data.planId, data.billingCycle || 'MONTHLY');
      return {
        success: true,
        message: 'Subscription plan successfully activated!',
        subscription: res.subscription,
        invoice: res.invoice,
      };
    });
  },

  // --- Notifications ---
  getNotifications: async (): Promise<ApiResponse<any>> => {
    return asyncWrap(() => [
      { id: 'notif_1', title: 'Welcome to Gold Stamp', message: 'You have joined the loyalty program!', isRead: true, createdAt: new Date().toISOString() }
    ]);
  },

  markNotificationRead: async (id: string): Promise<ApiResponse<any>> => {
    return asyncWrap(() => ({ success: true }));
  },

  markAllNotificationsRead: async (): Promise<ApiResponse<any>> => {
    return asyncWrap(() => ({ success: true }));
  },
};

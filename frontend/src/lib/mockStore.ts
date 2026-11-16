/**
 * LocalStorage Testing Engine for Gold Stamp
 * Provides complete in-browser persistence and state management across all 3 panels:
 * 1. Customer Panel (Loyalty cards, stamp progress, check-in, reward unlocks, redemption codes)
 * 2. Merchant Panel (Campaigns, counter QR kiosk, customer visits, staff, analytics, redemptions)
 * 3. Platform Admin Panel (Business approvals/suspensions, global users, industries, subscriptions)
 */

export interface PlatformSettings {
  autoApproveBusinesses: boolean;
  requireCustomerPhoneOtp: boolean;
  qrRefreshInterval: number;
  geofenceRadiusMeters: number;
  voucherExpiryMinutes: number;
  platformName: string;
  supportEmail: string;
  whatsappGatewayEnabled: boolean;
  smsGatewayEnabled: boolean;
  razorpayWebhooksActive: boolean;
  broadcast: {
    enabled: boolean;
    message: string;
    type: 'INFO' | 'WARNING' | 'ALERT';
    updatedAt: string;
  };
}

export interface MockStoreState {
  users: any[];
  businesses: any[];
  industries: any[];
  campaigns: any[];
  rewards: any[];
  customerBusinesses: any[];
  visits: any[];
  redemptions: any[];
  qrTokens: any[];
  staff: any[];
  plans: any[];
  subscriptions: any[];
  invoices: any[];
  auditLogs: any[];
  pendingVerifications: any[];
  passwordResetTokens: any[];
  customerOtps: any[];
  merchantOtps?: any[];
  settings?: PlatformSettings;
}

const STORAGE_KEY = 'goldstamp_local_test_db_v2';

const INITIAL_DATA: MockStoreState = {
  users: [
    {
      id: 'usr_admin',
      name: 'Platform Admin',
      email: 'admin@example.com',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      phone: '+919999988888',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'usr_owner_smash',
      name: 'Rohan Mehta',
      email: 'owner@smashzone.com',
      role: 'BUSINESS_OWNER',
      status: 'ACTIVE',
      phone: '+919900112233',
      createdAt: '2026-01-02T00:00:00Z',
    },
    {
      id: 'usr_staff_karan',
      name: 'Karan Dave',
      email: 'staff@smashzone.com',
      role: 'BUSINESS_STAFF',
      status: 'ACTIVE',
      phone: '+919876543210',
      createdAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'usr_owner_cafe',
      name: 'Ananya Sen',
      email: 'owner@cafeartisan.com',
      role: 'BUSINESS_OWNER',
      status: 'ACTIVE',
      phone: '+919811223344',
      createdAt: '2026-01-03T00:00:00Z',
    },
    {
      id: 'usr_customer_alex',
      name: 'Alex Rivera',
      email: 'alex@example.com',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      phone: '+919876500001',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      createdAt: '2026-01-10T00:00:00Z',
    },
    {
      id: 'usr_customer_priya',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      phone: '+919876500002',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      createdAt: '2026-01-12T00:00:00Z',
    },
  ],

  industries: [
    { id: 'ind_pickleball', name: 'Pickleball & Padel', slug: 'pickleball', icon: 'Activity', isActive: true },
    { id: 'ind_cafe', name: 'Café & Bakery', slug: 'cafe', icon: 'Coffee', isActive: true },
    { id: 'ind_cricket', name: 'Box Cricket & Turf', slug: 'box-cricket', icon: 'Trophy', isActive: true },
    { id: 'ind_salon', name: 'Salon & Spa', slug: 'salon', icon: 'Scissors', isActive: true },
    { id: 'ind_gym', name: 'Gym & Fitness', slug: 'gym', icon: 'Dumbbell', isActive: true },
    { id: 'ind_gaming', name: 'Gaming Zone & Esports', slug: 'gaming', icon: 'Gamepad2', isActive: true },
  ],

  businesses: [
    {
      id: 'biz_smashzone',
      name: 'SmashZone Pickleball Arena',
      slug: 'smashzone-pickleball',
      ownerId: 'usr_owner_smash',
      industryId: 'ind_pickleball',
      industry: { name: 'Pickleball & Padel', slug: 'pickleball' },
      logo: 'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?auto=format&fit=crop&w=300&q=80',
      coverImage: '/images/pickleball-arena.jpg',
      description: 'Premier indoor tournament-grade acrylic pickleball courts with floodlights, pro coaching, and lounge.',
      address: 'Plot 42, Vesu Sports Complex',
      city: 'Surat',
      state: 'Gujarat',
      phone: '+919900112233',
      email: 'contact@smashzone.com',
      status: 'ACTIVE',
      cooldownMinutes: 30,
      createdAt: '2026-01-05T00:00:00Z',
    },
    {
      id: 'biz_cafeartisan',
      name: 'Artisan Roastery & Café',
      slug: 'artisan-roastery-cafe',
      ownerId: 'usr_owner_cafe',
      industryId: 'ind_cafe',
      industry: { name: 'Café & Bakery', slug: 'cafe' },
      logo: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=300&q=80',
      coverImage: '/images/coffee-shop.jpg',
      description: 'Specialty coffee roastery offering single-origin pour-overs, cold brew, and fresh artisan sourdough treats.',
      address: '12 Indiranagar 100ft Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      phone: '+919811223344',
      email: 'hello@artisanroastery.com',
      status: 'ACTIVE',
      cooldownMinutes: 60,
      createdAt: '2026-01-06T00:00:00Z',
    },
    {
      id: 'biz_powerbox',
      name: 'PowerBox Cricket Arena',
      slug: 'powerbox-cricket-arena',
      ownerId: 'usr_owner_smash',
      industryId: 'ind_cricket',
      industry: { name: 'Box Cricket & Turf', slug: 'box-cricket' },
      logo: 'https://images.unsplash.com/photo-1531415074868-036b1c57e3b0?auto=format&fit=crop&w=300&q=80',
      coverImage: '/images/box-cricket.jpg',
      description: 'Air-conditioned indoor turf box cricket arena with professional bowling machines and live video replay.',
      address: 'Ring Road Arena',
      city: 'Ahmedabad',
      state: 'Gujarat',
      phone: '+919722334455',
      email: 'play@boxcricket.com',
      status: 'PENDING',
      cooldownMinutes: 30,
      createdAt: '2026-01-07T00:00:00Z',
    },
    {
      id: 'biz_aurora',
      name: 'Aurora Boutique Spa & Salon',
      slug: 'aurora-boutique-spa',
      ownerId: 'usr_owner_cafe',
      industryId: 'ind_salon',
      industry: { name: 'Salon & Spa', slug: 'salon' },
      logo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=300&q=80',
      coverImage: '/images/boutique-salon.jpg',
      description: 'Luxury organic hair salon, sensory massage rituals, and skincare therapies in a calming aesthetic studio.',
      address: '7 Coral Promenade',
      city: 'Mumbai',
      state: 'Maharashtra',
      phone: '+919833445566',
      email: 'concierge@auroraspa.com',
      status: 'ACTIVE',
      cooldownMinutes: 120,
      createdAt: '2026-01-08T00:00:00Z',
    },
  ],

  campaigns: [
    {
      id: 'cmp_smash_10',
      businessId: 'biz_smashzone',
      name: 'Play 10 Hours → Get 1 Hour FREE',
      description: 'Visit SmashZone 10 times to unlock 1 full court hour completely free!',
      type: 'VISIT',
      status: 'ACTIVE',
      isRecurring: true,
      rules: [{ conditionType: 'VISIT_COUNT', conditionValue: 10, rewardType: 'FREE_SERVICE' }],
      rewards: [
        {
          id: 'rwd_smash_free_hour',
          businessId: 'biz_smashzone',
          title: '1 Hour FREE Pickleball Court',
          description: 'Valid for full court reservation on any weekday or weekend slot.',
          type: 'FREE_SERVICE',
          value: '1 Hour Free',
          status: 'AVAILABLE',
        },
      ],
    },
    {
      id: 'cmp_cafe_5',
      businessId: 'biz_cafeartisan',
      name: 'Coffee Lover Stamps (5 Stamps → Free Brew)',
      description: 'Buy 5 handcrafted coffees and enjoy your 6th cup on the house!',
      type: 'STAMP',
      status: 'ACTIVE',
      isRecurring: true,
      rules: [{ conditionType: 'STAMP_COUNT', conditionValue: 5, rewardType: 'FREE_PRODUCT' }],
      rewards: [
        {
          id: 'rwd_cafe_free_coffee',
          businessId: 'biz_cafeartisan',
          title: 'Free Specialty Pour-Over Coffee',
          description: 'Valid for any single-origin Ethiopian or Colombian pour-over or signature iced latte.',
          type: 'FREE_PRODUCT',
          value: 'Free Brew',
          status: 'AVAILABLE',
        },
      ],
    },
    {
      id: 'cmp_aurora_4',
      businessId: 'biz_aurora',
      name: 'Glow Loyalty Pass (4 Visits → Free Hair Spa)',
      description: 'Visit 4 times for styling or facial services to unlock a complimentary deluxe hair treatment.',
      type: 'VISIT',
      status: 'ACTIVE',
      isRecurring: true,
      rules: [{ conditionType: 'VISIT_COUNT', conditionValue: 4, rewardType: 'FREE_SERVICE' }],
      rewards: [
        {
          id: 'rwd_aurora_treatment',
          businessId: 'biz_aurora',
          title: 'Complimentary Deluxe Hair Spa Treatment',
          description: 'Deep conditioning steam treatment infused with organic botanical oils.',
          type: 'FREE_SERVICE',
          value: 'Free Treatment',
          status: 'AVAILABLE',
        },
      ],
    },
  ],

  rewards: [
    {
      id: 'rwd_smash_free_hour',
      businessId: 'biz_smashzone',
      campaignId: 'cmp_smash_10',
      title: '1 Hour FREE Pickleball Court',
      description: 'Valid for full court reservation on any weekday or weekend slot.',
      type: 'FREE_SERVICE',
      value: '1 Hour Free',
      status: 'AVAILABLE',
    },
    {
      id: 'rwd_cafe_free_coffee',
      businessId: 'biz_cafeartisan',
      campaignId: 'cmp_cafe_5',
      title: 'Free Specialty Pour-Over Coffee',
      description: 'Valid for any single-origin Ethiopian or Colombian pour-over.',
      type: 'FREE_PRODUCT',
      value: 'Free Brew',
      status: 'AVAILABLE',
    },
  ],

  // Fresh starting state: zero initial memberships, visits, or redemptions
  customerBusinesses: [],
  redemptions: [],
  visits: [],
  qrTokens: [],

  staff: [
    {
      id: 'stf_1',
      businessId: 'biz_smashzone',
      userId: 'usr_staff_karan',
      name: 'Karan Dave',
      email: 'staff@smashzone.com',
      role: 'BUSINESS_STAFF',
      isActive: true,
      createdAt: '2026-01-10T00:00:00Z',
    },
  ],

  plans: [
    {
      id: 'plan_starter',
      name: 'Starter',
      code: 'STARTER',
      price: 499,
      annualPrice: 399,
      description: 'Ideal for single cafés, box cricket turfs, and boutique outlets.',
      maxBranches: 1,
      maxStaff: 2,
      features: [
        '1 Active Venue / Court Location',
        'Up to 2 Counter Staff Logins',
        'Dynamic Anti-Fraud QR Kiosk (60s rotation)',
        'Single-Use Milestone Vouchers',
        'Standard Email & Community Support',
      ],
    },
    {
      id: 'plan_growth',
      name: 'Growth',
      code: 'GROWTH',
      price: 999,
      annualPrice: 799,
      description: 'Most popular for high-traffic pickleball arenas, sports hubs & busy cafés.',
      maxBranches: 3,
      maxStaff: 10,
      features: [
        'Up to 3 Branches & Venues',
        'Up to 10 Front-Desk Staff Accounts',
        'Unlimited Digital Stamp Cards & Campaigns',
        'Real-Time Footfall & Retention Analytics',
        'Custom Venue Branding & Reward Customization',
        'Priority Phone & WhatsApp Support',
      ],
    },
    {
      id: 'plan_pro',
      name: 'Pro Enterprise',
      code: 'PRO',
      price: 1999,
      annualPrice: 1599,
      description: 'Full multi-city franchise expansion with POS/ERP webhooks & dedicated manager.',
      maxBranches: 999,
      maxStaff: 999,
      features: [
        'Unlimited Venues & Franchise Network',
        'Unlimited Staff Logins & RBAC Multi-Terminal',
        'Automated WhatsApp Check-In & Reward Alerts',
        'Custom Domain & POS Webhook Integration',
        'Dedicated Customer Success Manager (SLA 99.9%)',
      ],
    },
  ],

  subscriptions: [
    {
      id: 'sub_smashzone',
      businessId: 'biz_smashzone',
      planId: 'plan_growth',
      status: 'ACTIVE',
      billingCycle: 'MONTHLY',
      amount: 999,
      monthlyEquivalent: 999,
      savingsPerYear: 0,
      currentPeriodStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      currentPeriodEnd: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      paymentMethod: 'UPI AutoPay (••rohan@oksbi)',
    },
    {
      id: 'sub_cafeartisan',
      businessId: 'biz_cafeartisan',
      planId: 'plan_growth',
      status: 'ACTIVE',
      billingCycle: 'ANNUAL',
      amount: 9588,
      monthlyEquivalent: 799,
      savingsPerYear: 2400,
      currentPeriodStart: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      currentPeriodEnd: new Date(Date.now() + 320 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      paymentMethod: 'HDFC Corp Auto-Debit (••priya@hdfc)',
    },
    {
      id: 'sub_aurora',
      businessId: 'biz_aurora',
      planId: 'plan_pro',
      status: 'ACTIVE',
      billingCycle: 'ANNUAL',
      amount: 19188,
      monthlyEquivalent: 1599,
      savingsPerYear: 4800,
      currentPeriodStart: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      currentPeriodEnd: new Date(Date.now() + 345 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      paymentMethod: 'ICICI Business Card (••4421)',
    },
    {
      id: 'sub_powerbox',
      businessId: 'biz_powerbox',
      planId: 'plan_starter',
      status: 'TRIAL',
      billingCycle: 'MONTHLY',
      amount: 499,
      monthlyEquivalent: 499,
      savingsPerYear: 0,
      currentPeriodStart: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      currentPeriodEnd: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      paymentMethod: '14-Day Free Trial',
    },
  ],

  invoices: [
    {
      id: 'INV-2026-005',
      businessId: 'biz_aurora',
      planName: 'Pro Enterprise Plan (Annual 20% OFF)',
      amount: 19188,
      status: 'PAID',
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: 'ICICI Business Card',
    },
    {
      id: 'INV-2026-004',
      businessId: 'biz_cafeartisan',
      planName: 'Growth Plan (Annual 20% OFF)',
      amount: 9588,
      status: 'PAID',
      date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: 'HDFC Corp Auto-Debit',
    },
    {
      id: 'INV-2026-003',
      businessId: 'biz_smashzone',
      planName: 'Growth Plan (Monthly)',
      amount: 999,
      status: 'PAID',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: 'UPI AutoPay',
    },
    {
      id: 'INV-2026-002',
      businessId: 'biz_smashzone',
      planName: 'Growth Plan',
      amount: 999,
      status: 'PAID',
      date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: 'UPI AutoPay',
    },
    {
      id: 'INV-2026-001',
      businessId: 'biz_smashzone',
      planName: 'Growth Plan (Pro-rata)',
      amount: 999,
      status: 'PAID',
      date: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: 'UPI AutoPay',
    },
  ],

  auditLogs: [],
  pendingVerifications: [],
  passwordResetTokens: [],
  customerOtps: [],

  settings: {
    autoApproveBusinesses: false,
    requireCustomerPhoneOtp: true,
    qrRefreshInterval: 60,
    geofenceRadiusMeters: 200,
    voucherExpiryMinutes: 15,
    platformName: 'Gold Stamp Loyalty Cloud',
    supportEmail: 'support@goldstamp.io',
    whatsappGatewayEnabled: true,
    smsGatewayEnabled: true,
    razorpayWebhooksActive: true,
    broadcast: {
      enabled: false,
      message: 'Notice: Platform scheduled maintenance window on Sunday at 02:00 AM IST.',
      type: 'INFO',
      updatedAt: '2026-10-09T18:00:00.000Z',
    },
  },
};

class MockDataStore {
  private getDb(): MockStoreState {
    if (typeof window === 'undefined') return INITIAL_DATA;
    // Auto purge legacy v1 store and tokens if present
    if (localStorage.getItem('goldstamp_local_test_db_v1')) {
      localStorage.removeItem('goldstamp_local_test_db_v1');
      localStorage.removeItem('goldstamp_token');
      localStorage.removeItem('goldstamp_refresh_token');
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.auditLogs) parsed.auditLogs = [];
      if (!parsed.pendingVerifications) parsed.pendingVerifications = [];
      if (!parsed.passwordResetTokens) parsed.passwordResetTokens = [];
      if (!parsed.customerOtps) parsed.customerOtps = [];
      return parsed;
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
  }

  public saveDb(state: MockStoreState) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }

  public resetToSeed() {
    this.saveDb(INITIAL_DATA);
    return INITIAL_DATA;
  }

  public clearAllData() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('goldstamp_local_test_db_v1');
      localStorage.removeItem('goldstamp_token');
      localStorage.removeItem('goldstamp_refresh_token');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    }
    return INITIAL_DATA;
  }

  public getRaw(): MockStoreState {
    return this.getDb();
  }

  public syncUser(user: any) {
    if (!user) return;
    const db = this.getDb();
    const idx = db.users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      db.users[idx] = { ...db.users[idx], ...user };
    } else {
      db.users.push(user);
    }
    this.saveDb(db);
  }

  public syncBusiness(business: any) {
    if (!business) return;
    const db = this.getDb();
    const idx = db.businesses.findIndex((b) => b.id === business.id || b.slug === business.slug);
    if (idx >= 0) {
      db.businesses[idx] = { ...db.businesses[idx], ...business };
    } else {
      db.businesses.push(business);
    }
    this.saveDb(db);
  }

  // --- Merchant Email Confirmation & Authentication Flow ---
  public createPendingMerchantRegistration(data: {
    businessName: string;
    ownerName: string;
    email: string;
    phone?: string;
    industry?: string;
    city?: string;
    password: string;
  }) {
    const db = this.getDb();
    const cleanEmail = data.email.trim().toLowerCase();

    // Check if user already exists and is active
    const existingActive = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingActive) {
      throw new Error('An account with this email address is already registered. Please sign in.');
    }

    // Check if phone number is already registered
    if (data.phone) {
      const cleanPhone = data.phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length >= 10) {
        const targetPhone = cleanPhone.slice(-10);
        const existingPhone = db.users.find((u) => {
          if (!u.phone) return false;
          const uClean = u.phone.replace(/[^0-9]/g, '');
          return uClean.length >= 10 && uClean.slice(-10) === targetPhone;
        });
        if (existingPhone) {
          throw new Error('An account with this phone number is already registered. Please sign in or use another number.');
        }
      }
    }

    // Check if business with same name already registered
    const cleanBName = data.businessName.trim().toLowerCase();
    const existingBusiness = (db.businesses || []).find((b) => b.name?.toLowerCase() === cleanBName);
    if (existingBusiness) {
      throw new Error('A business with this name is already registered. Please use another name.');
    }

    // Generate secure verification token
    const token = `verify_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    const pendingRecord = {
      id: `pend_${Date.now()}`,
      name: data.ownerName,
      email: cleanEmail,
      phone: data.phone || '',
      password: data.password,
      businessName: data.businessName,
      industry: data.industry || 'Local Commerce',
      city: data.city || '',
      verificationToken: token,
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    // Remove any previous pending registration for this email
    db.pendingVerifications = (db.pendingVerifications || []).filter(
      (p) => p.email.toLowerCase() !== cleanEmail
    );
    db.pendingVerifications.push(pendingRecord);
    this.saveDb(db);

    return {
      verificationToken: token,
      email: cleanEmail,
      businessName: data.businessName,
      expiresAt,
    };
  }

  public getPendingVerificationByEmail(email: string) {
    const db = this.getDb();
    return (db.pendingVerifications || []).find((p) => p.email.toLowerCase() === email.trim().toLowerCase()) || null;
  }

  public getPendingVerificationByToken(token: string) {
    const db = this.getDb();
    return (db.pendingVerifications || []).find((p) => p.verificationToken === token) || null;
  }

  public verifyMerchantEmail(token: string) {
    const db = this.getDb();
    const pending = (db.pendingVerifications || []).find((p) => p.verificationToken === token);

    if (!pending) {
      throw new Error('INVALID_TOKEN: Verification link is invalid or has already been used.');
    }

    if (new Date(pending.expiresAt).getTime() < Date.now()) {
      throw new Error('EXPIRED_TOKEN: This confirmation link has expired. Please register again or request a new link.');
    }

    // Now safely create the authenticated merchant user in the active DB
    const userId = `usr_owner_${Date.now()}`;
    const newUser = {
      id: userId,
      name: pending.name,
      email: pending.email,
      phone: pending.phone || '',
      password: pending.password,
      role: 'BUSINESS_OWNER',
      status: 'ACTIVE',
      emailVerified: true,
      emailVerifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);

    // Create the business record
    const baseSlug = pending.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const bizSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    const newBiz = {
      id: `biz_${Date.now()}`,
      name: pending.businessName,
      slug: bizSlug,
      ownerId: userId,
      industryId: 'ind_custom',
      industry: { name: pending.industry, slug: 'custom' },
      logo: null,
      coverImage: '/images/hero-counter.jpg',
      description: `Premier ${pending.industry} in ${pending.city || 'India'}`,
      address: pending.city || 'Headquarters',
      city: pending.city || '',
      phone: pending.phone || '',
      email: pending.email,
      status: 'ACTIVE',
      cooldownMinutes: 30,
      createdAt: new Date().toISOString(),
    };
    db.businesses.push(newBiz);

    // Audit log confirmation
    db.auditLogs = db.auditLogs || [];
    db.auditLogs.unshift({
      id: `audit_verify_${Date.now()}`,
      action: 'MERCHANT_EMAIL_CONFIRMED',
      actor: { name: pending.name, email: pending.email },
      actorRole: 'BUSINESS_OWNER',
      entityId: userId,
      entityType: 'USER_VERIFICATION',
      status: 'VERIFIED',
      metadata: { businessName: pending.businessName, token: token.substring(0, 10) + '...' },
      createdAt: new Date().toISOString(),
    });

    // Remove from pending registrations
    db.pendingVerifications = db.pendingVerifications.filter((p) => p.verificationToken !== token);
    this.saveDb(db);

    return {
      success: true,
      user: newUser,
      business: newBiz,
    };
  }

  public resendMerchantVerificationEmail(email: string) {
    const db = this.getDb();
    const cleanEmail = email.trim().toLowerCase();

    // Check if already active
    if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('ALREADY_VERIFIED: This account is already confirmed. You can log in directly.');
    }

    const pending = (db.pendingVerifications || []).find((p) => p.email.toLowerCase() === cleanEmail);
    if (!pending) {
      throw new Error('NOT_FOUND: No pending registration found for this email. Please register first.');
    }

    // Refresh token
    const token = `verify_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
    pending.verificationToken = token;
    pending.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    this.saveDb(db);

    return {
      success: true,
      verificationToken: token,
      email: cleanEmail,
    };
  }

  // --- Merchant OTP Verification Flow ---
  public createMerchantOtp(data: {
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    industry?: string;
    city?: string;
    password: string;
  }) {
    const db = this.getDb();
    const cleanEmail = data.email.trim().toLowerCase();

    // Check if user already exists
    const existingActive = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingActive) {
      throw new Error('An account with this email address is already registered. Please sign in to your Merchant Console.');
    }

    // Check if phone already registered
    if (data.phone) {
      const cleanPhone = data.phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length >= 10) {
        const targetPhone = cleanPhone.slice(-10);
        const existingPhone = db.users.find((u) => {
          if (!u.phone) return false;
          const uClean = u.phone.replace(/[^0-9]/g, '');
          return uClean.length >= 10 && uClean.slice(-10) === targetPhone;
        });
        if (existingPhone) {
          throw new Error('An account with this phone number is already registered. Please sign in or use another number.');
        }
      }
    }

    // Check if business name already exists
    const cleanBName = data.businessName.trim().toLowerCase();
    const existingBusiness = (db.businesses || []).find((b) => b.name?.toLowerCase() === cleanBName);
    if (existingBusiness) {
      throw new Error('A business with this name is already registered. Please choose another name.');
    }

    // Generate 6-digit cryptographic OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationSessionId = `m_session_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    db.merchantOtps = (db.merchantOtps || []).filter((o: any) => o.email.toLowerCase() !== cleanEmail);
    db.merchantOtps.push({
      verificationSessionId,
      email: cleanEmail,
      phone: data.phone.trim(),
      ownerName: data.ownerName.trim(),
      businessName: data.businessName.trim(),
      industry: data.industry || 'Local Commerce',
      city: data.city || '',
      password: data.password,
      otpCode,
      attempts: 0,
      maxAttempts: 5,
      expiresAt,
      createdAt: new Date().toISOString(),
    });
    this.saveDb(db);

    return {
      success: true,
      verificationSessionId,
      email: cleanEmail,
      businessName: data.businessName.trim(),
      expiresAt,
      otpCode,
    };
  }

  public verifyMerchantOtp(sessionId: string, code: string) {
    const db = this.getDb();
    const record = (db.merchantOtps || []).find((o: any) => o.verificationSessionId === sessionId);

    if (!record) {
      throw new Error('INVALID_SESSION: Verification session not found or expired. Please register again.');
    }

    if (new Date(record.expiresAt).getTime() < Date.now()) {
      throw new Error('EXPIRED_CODE: Verification code has expired. Please request a new code.');
    }

    if (record.attempts >= record.maxAttempts) {
      throw new Error('MAX_ATTEMPTS_EXCEEDED: Too many incorrect attempts. Please request a new code.');
    }

    if (record.otpCode !== code.trim()) {
      record.attempts += 1;
      this.saveDb(db);
      const remaining = record.maxAttempts - record.attempts;
      throw new Error(`INCORRECT_CODE: Incorrect verification code. ${remaining} attempts remaining.`);
    }

    // Successfully verified! Create owner and business
    const ownerId = `usr_owner_${Date.now()}`;
    const newUser = {
      id: ownerId,
      name: record.ownerName,
      email: record.email,
      phone: record.phone,
      password: record.password,
      role: 'BUSINESS_OWNER',
      status: 'ACTIVE',
      isVerified: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);

    const baseSlug = record.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const bizSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    const newBusiness = {
      id: `biz_${Date.now()}`,
      name: record.businessName,
      slug: bizSlug,
      ownerId: ownerId,
      industryId: 'ind_custom',
      industry: { name: record.industry, slug: 'custom' },
      logo: null,
      coverImage: '/images/hero-counter.jpg',
      description: `Premier ${record.industry} in ${record.city || 'India'}`,
      address: record.city || 'Headquarters',
      city: record.city || '',
      phone: record.phone || '',
      email: record.email,
      status: 'ACTIVE',
      cooldownMinutes: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.businesses = db.businesses || [];
    db.businesses.push(newBusiness);

    // Remove OTP record
    db.merchantOtps = (db.merchantOtps || []).filter((o: any) => o.verificationSessionId !== sessionId);

    // Audit log
    db.auditLogs = db.auditLogs || [];
    db.auditLogs.unshift({
      id: `audit_merch_reg_${Date.now()}`,
      action: 'MERCHANT_EMAIL_OTP_VERIFIED',
      actor: { name: newUser.name, email: newUser.email },
      actorRole: 'BUSINESS_OWNER',
      entityId: newBusiness.id,
      entityType: 'BUSINESS_REGISTRATION',
      status: 'VERIFIED',
      createdAt: new Date().toISOString(),
    });

    this.saveDb(db);

    const token = `biz_jwt_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;

    return {
      success: true,
      user: newUser,
      business: newBusiness,
      token,
      message: 'Business account verified and activated successfully.',
    };
  }

  public resendMerchantOtp(sessionId: string) {
    const db = this.getDb();
    const record = (db.merchantOtps || []).find((o: any) => o.verificationSessionId === sessionId);

    if (!record) {
      throw new Error('INVALID_SESSION: Verification session not found. Please register again.');
    }

    const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    record.otpCode = newOtpCode;
    record.attempts = 0;
    record.expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    this.saveDb(db);

    return {
      success: true,
      verificationSessionId: sessionId,
      email: record.email,
      expiresAt: record.expiresAt,
      otpCode: newOtpCode,
    };
  }

  // --- Merchant & User Password Reset ---
  public requestPasswordReset(email: string) {
    const db = this.getDb();
    const cleanEmail = email.trim().toLowerCase();
    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      // Check if it's pending
      const isPending = (db.pendingVerifications || []).some((p) => p.email.toLowerCase() === cleanEmail);
      if (isPending) {
        throw new Error('EMAIL_NOT_VERIFIED: Your email is awaiting confirmation. Please click the activation link in your inbox.');
      }
      throw new Error('ACCOUNT_NOT_FOUND: No active account found with this email address.');
    }

    const resetToken = `reset_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    db.passwordResetTokens = db.passwordResetTokens || [];
    db.passwordResetTokens = db.passwordResetTokens.filter((r) => r.email.toLowerCase() !== cleanEmail);
    db.passwordResetTokens.push({
      email: cleanEmail,
      userId: user.id,
      resetToken,
      expiresAt,
      createdAt: new Date().toISOString(),
    });
    this.saveDb(db);

    return {
      success: true,
      resetToken,
      email: cleanEmail,
    };
  }

  public resetPassword(token: string, newPassword: string) {
    const db = this.getDb();
    const record = (db.passwordResetTokens || []).find((r) => r.resetToken === token);

    if (!record) {
      throw new Error('INVALID_TOKEN: Password reset link is invalid or has expired.');
    }

    if (new Date(record.expiresAt).getTime() < Date.now()) {
      throw new Error('EXPIRED_TOKEN: Password reset link has expired. Please request a new one.');
    }

    const user = db.users.find((u) => u.id === record.userId || u.email.toLowerCase() === record.email.toLowerCase());
    if (!user) {
      throw new Error('USER_NOT_FOUND: Associated user account could not be found.');
    }

    user.password = newPassword;
    db.passwordResetTokens = db.passwordResetTokens.filter((r) => r.resetToken !== token);

    db.auditLogs = db.auditLogs || [];
    db.auditLogs.unshift({
      id: `audit_pwd_${Date.now()}`,
      action: 'PASSWORD_RESET_SUCCESS',
      actor: { name: user.name, email: user.email },
      actorRole: user.role,
      entityId: user.id,
      entityType: 'AUTH',
      status: 'VERIFIED',
      createdAt: new Date().toISOString(),
    });

    this.saveDb(db);
    return { success: true };
  }

  public createCustomerOtp(data: { name: string; email: string; phone: string; password: string }) {
    const db = this.getDb();
    const cleanEmail = data.email.trim().toLowerCase();

    // Check if email already registered
    const existing = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this Gmail address is already registered. Please log in.');
    }

    // Check if phone number already registered
    const cleanPhone = (data.phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone && cleanPhone.length >= 10) {
      const targetPhone = cleanPhone.slice(-10);
      const existingPhone = db.users.find((u) => {
        if (!u.phone) return false;
        const uClean = u.phone.replace(/[^0-9]/g, '');
        return uClean.length >= 10 && uClean.slice(-10) === targetPhone;
      });
      if (existingPhone) {
        throw new Error('An account with this phone number is already registered. Please log in or use another number.');
      }
    }

    // Generate 6-digit cryptographic OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationSessionId = `cs_session_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    db.customerOtps = (db.customerOtps || []).filter((o) => o.email.toLowerCase() !== cleanEmail);
    db.customerOtps.push({
      verificationSessionId,
      email: cleanEmail,
      phone: data.phone.trim(),
      name: data.name.trim(),
      password: data.password,
      otpCode,
      attempts: 0,
      maxAttempts: 5,
      expiresAt,
      createdAt: new Date().toISOString(),
    });
    this.saveDb(db);

    return {
      success: true,
      verificationSessionId,
      email: cleanEmail,
      phone: data.phone.trim(),
      name: data.name.trim(),
      expiresAt,
      otpCode,
    };
  }

  public verifyCustomerOtp(sessionId: string, code: string) {
    const db = this.getDb();
    const record = (db.customerOtps || []).find((o) => o.verificationSessionId === sessionId);

    if (!record) {
      throw new Error('INVALID_SESSION: Verification session not found or expired. Please sign up again.');
    }

    if (new Date(record.expiresAt).getTime() < Date.now()) {
      throw new Error('EXPIRED_CODE: Verification code has expired. Please request a new code.');
    }

    if (record.attempts >= record.maxAttempts) {
      throw new Error('MAX_ATTEMPTS_EXCEEDED: Too many incorrect attempts. Please request a new verification code.');
    }

    if (record.otpCode !== code.trim()) {
      record.attempts += 1;
      this.saveDb(db);
      const remaining = record.maxAttempts - record.attempts;
      throw new Error(`INCORRECT_CODE: Incorrect verification code. ${remaining} attempts remaining.`);
    }

    // Successfully verified! Create customer user in mock db
    const customerId = `cust_${Date.now()}`;
    const newUser = {
      id: customerId,
      name: record.name,
      email: record.email,
      phone: record.phone,
      password: record.password,
      role: 'CUSTOMER',
      isVerified: true,
      emailVerified: true,
      phoneVerified: true,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    // Remove the OTP record
    db.customerOtps = (db.customerOtps || []).filter((o) => o.verificationSessionId !== sessionId);

    // Audit log
    db.auditLogs = db.auditLogs || [];
    db.auditLogs.unshift({
      id: `audit_cust_reg_${Date.now()}`,
      action: 'CUSTOMER_EMAIL_OTP_VERIFIED',
      actor: { name: newUser.name, email: newUser.email },
      actorRole: 'CUSTOMER',
      entityId: newUser.id,
      entityType: 'CUSTOMER_AUTH',
      status: 'VERIFIED',
      createdAt: new Date().toISOString(),
    });

    this.saveDb(db);

    const token = `cust_jwt_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;

    return {
      success: true,
      user: newUser,
      token,
      message: 'Account verified and registered successfully.',
    };
  }

  public resendCustomerOtp(sessionId: string) {
    const db = this.getDb();
    const record = (db.customerOtps || []).find((o) => o.verificationSessionId === sessionId);

    if (!record) {
      throw new Error('INVALID_SESSION: Verification session not found. Please sign up again.');
    }

    const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    record.otpCode = newOtpCode;
    record.attempts = 0;
    record.expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    this.saveDb(db);

    return {
      success: true,
      verificationSessionId: sessionId,
      email: record.email,
      expiresAt: record.expiresAt,
      otpCode: newOtpCode,
    };
  }

  public getUserByEmail(email: string) {
    const db = this.getDb();
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public getUserByPhone(phone: string) {
    const db = this.getDb();
    const clean = phone.replace(/[^0-9]/g, '');
    if (!clean) return null;
    return db.users.find((u) => {
      if (!u.phone) return false;
      const uClean = u.phone.replace(/[^0-9]/g, '');
      return uClean === clean || uClean.endsWith(clean) || clean.endsWith(uClean);
    }) || null;
  }

  public getWhatsAppUrl(phone: string, text: string) {
    const clean = phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
  }

  public getUserById(id: string) {
    const db = this.getDb();
    return db.users.find((u) => u.id === id) || null;
  }

  public createUser(userData: any) {
    const db = this.getDb();
    if (userData.email) {
      const cleanEmail = userData.email.toLowerCase().trim();
      const existingEmail = db.users.find((u) => u.email.toLowerCase().trim() === cleanEmail);
      if (existingEmail) {
        return existingEmail;
      }
    }
    if (userData.phone) {
      const cleanPhone = userData.phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length >= 10) {
        const targetPhone = cleanPhone.slice(-10);
        const existingPhone = db.users.find((u) => {
          if (!u.phone) return false;
          const uClean = u.phone.replace(/[^0-9]/g, '');
          return uClean.length >= 10 && uClean.slice(-10) === targetPhone;
        });
        if (existingPhone) {
          throw new Error('An account with this phone number is already registered.');
        }
      }
    }
    const newUser = {
      id: `usr_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      role: userData.role || 'CUSTOMER',
      status: 'ACTIVE',
      avatar: userData.avatar || null,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    this.saveDb(db);
    return newUser;
  }

  public updateUser(id: string, updates: any) {
    const db = this.getDb();
    const user = db.users.find((u) => u.id === id);
    if (!user) throw new Error('User not found');
    Object.assign(user, updates);
    this.saveDb(db);
    return user;
  }

  // --- Businesses ---
  public getBusinesses(params?: { industry?: string; search?: string; status?: string }) {
    const db = this.getDb();
    let list = db.businesses.map((biz) => {
      const activeCampaigns = db.campaigns.filter((c) => c.businessId === biz.id);
      const industry = db.industries.find((i) => i.id === biz.industryId) || biz.industry;
      return {
        ...biz,
        industry,
        campaigns: activeCampaigns,
      };
    });

    if (params?.industry) {
      list = list.filter((b) => b.industry?.slug === params.industry || b.industryId === params.industry);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((b) => b.name.toLowerCase().includes(q) || b.city?.toLowerCase().includes(q));
    }
    if (params?.status) {
      list = list.filter((b) => b.status === params.status);
    }
    return list;
  }

  public getBusinessBySlug(slug: string) {
    const db = this.getDb();
    const biz = db.businesses.find((b) => b.slug === slug);
    if (!biz) return null;
    const campaigns = db.campaigns.filter((c) => c.businessId === biz.id);
    const industry = db.industries.find((i) => i.id === biz.industryId) || biz.industry;
    return {
      ...biz,
      industry,
      campaigns,
    };
  }

  public getBusinessByOwnerId(ownerId: string) {
    const db = this.getDb();
    return db.businesses.find((b) => b.ownerId === ownerId) || db.businesses[0];
  }

  public updateBusiness(bizId: string, updates: any) {
    const db = this.getDb();
    const b = db.businesses.find((x) => x.id === bizId);
    if (b) {
      Object.assign(b, updates);
      this.saveDb(db);
    }
    return b;
  }

  // --- Dynamic QR Engine ---
  public generateQrToken(businessId: string, branchId?: string) {
    const db = this.getDb();
    const biz = db.businesses.find((b) => b.id === businessId);
    if (!biz) throw new Error('Business not found');

    const token = `qr_${businessId.substring(0, 6)}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const expiresAt = new Date(Date.now() + 60 * 1000).toISOString(); // 60s TTL

    const record = { token, businessId, branchId, expiresAt, isUsed: false, createdAt: new Date().toISOString() };
    db.qrTokens = db.qrTokens.filter((q) => new Date(q.expiresAt).getTime() > Date.now()); // prune expired
    db.qrTokens.push(record);
    this.saveDb(db);

    const checkInUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/checkin?token=${token}`;
    return {
      token,
      expiresAt,
      expiresInSeconds: 60,
      businessId,
      checkInUrl,
    };
  }

  public processCheckIn(tokenOrPayload: any, userId?: string) {
    const db = this.getDb();
    const token = typeof tokenOrPayload === 'string'
      ? tokenOrPayload
      : (tokenOrPayload?.qrToken || tokenOrPayload?.token || '');
    const activeUserId = userId || (typeof tokenOrPayload === 'object' ? tokenOrPayload?.customerId : null) || 'usr_customer_alex';
    const user = db.users.find((u) => u.id === activeUserId) || db.users[3] || { id: activeUserId, name: 'Customer', email: 'guest@example.com' };

    // 1. Strict Anti-Fraud Token Verification & Single-Use Enforcement
    const qrRecord = db.qrTokens.find((q) => q.token === token);
    if (!qrRecord) {
      throw new Error('INVALID_TOKEN: QR token is invalid, unrecognized, or has expired. Please scan a fresh counter QR code.');
    }

    if (qrRecord.isUsed) {
      if (!db.auditLogs) db.auditLogs = [];
      db.auditLogs.unshift({
        id: `audit_fraud_${Date.now()}`,
        action: 'SCREENSHOT_REPLAY_ATTEMPT_BLOCKED',
        actor: { name: user.name || 'Patron' },
        actorRole: 'CUSTOMER',
        entityId: qrRecord.id,
        entityType: 'ANTI_FRAUD_SCAN',
        status: 'BLOCKED',
        metadata: { token: qrRecord.token?.substring(0, 16) + '...', reason: 'Single-use token reuse attempt (photo/screenshot replay blocked)' },
        createdAt: new Date().toISOString(),
      });
      this.saveDb(db);
      throw new Error('FRAUD_PREVENTED: This QR code has already been scanned and consumed. Once scanned, tokens are instantly burned and screenshots cannot be reused.');
    }

    if (new Date(qrRecord.expiresAt).getTime() < Date.now()) {
      throw new Error('EXPIRED_TOKEN: This QR code has expired (60-second validity). Please scan the current code on the counter screen.');
    }

    const businessId = qrRecord.businessId;
    const business = db.businesses.find((b) => b.id === businessId);
    if (!business) throw new Error('Business not found');

    // 2. Anti-Fraud Visit Cooldown Check (e.g. 5 minutes minimum between visits at same venue)
    const cooldownMs = (business.cooldownMinutes || 5) * 60 * 1000;
    const recentVisit = db.visits.find(
      (v) => v.userId === activeUserId && v.businessId === businessId && Date.now() - new Date(v.createdAt).getTime() < cooldownMs
    );
    if (recentVisit) {
      const remainingMinutes = Math.ceil(
        (cooldownMs - (Date.now() - new Date(recentVisit.createdAt).getTime())) / (60 * 1000)
      );
      throw new Error(`COOLDOWN_ACTIVE: You have already checked in recently. Cooldown active for ${remainingMinutes} more minute(s).`);
    }

    // 3. Atomically Burn the QR Token (Single-Use Guarantee)
    qrRecord.isUsed = true;
    (qrRecord as any).usedAt = new Date().toISOString();
    (qrRecord as any).usedBy = activeUserId;

    if (!db.auditLogs) db.auditLogs = [];
    db.auditLogs.unshift({
      id: `audit_burn_${Date.now()}`,
      action: 'SINGLE_USE_TOKEN_BURNED_INSTANTLY',
      actor: { name: user.name || 'Patron' },
      actorRole: 'CUSTOMER',
      entityId: qrRecord.id,
      entityType: 'ANTI_FRAUD_VERIFICATION',
      status: 'VERIFIED',
      metadata: { token: qrRecord.token?.substring(0, 16) + '...', venue: business.name },
      createdAt: new Date().toISOString(),
    });

    // 4. Find active campaign
    const campaign = db.campaigns.find((c) => c.businessId === businessId && c.status === 'ACTIVE') || db.campaigns[0];
    const milestoneTarget = campaign?.rules?.[0]?.conditionValue || 10;

    // 5. Find or create CustomerBusiness relation
    let cb = db.customerBusinesses.find((c) => c.userId === activeUserId && c.businessId === businessId);
    if (!cb) {
      cb = {
        id: `cb_${Date.now()}`,
        userId: activeUserId,
        businessId,
        totalVisits: 0,
        totalStamps: 0,
        totalPoints: 0,
        joinedAt: new Date().toISOString(),
      };
      db.customerBusinesses.push(cb);
    }

    // 4. Increment visits and stamps
    cb.totalVisits += 1;
    cb.totalStamps += 1;
    cb.totalPoints += 20;
    cb.lastVisitAt = new Date().toISOString();

    // 5. Create Visit record
    const visit = {
      id: `vst_${Date.now()}`,
      userId: activeUserId,
      businessId,
      campaignId: campaign.id,
      verificationMethod: 'QR',
      createdAt: new Date().toISOString(),
      user: { name: user.name, email: user.email },
    };
    db.visits.unshift(visit);

    // 6. Check Milestone Unlock
    const cycleStamps = cb.totalStamps % milestoneTarget === 0 ? milestoneTarget : cb.totalStamps % milestoneTarget;
    let rewardUnlocked = null;

    if (cb.totalStamps > 0 && cb.totalStamps % milestoneTarget === 0) {
      const rewardDef = campaign.rewards?.[0] || db.rewards[0];
      const prefix = business.name.replace(/[^A-Za-z]/g, '').substring(0, 5).toUpperCase();
      const code = `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      rewardUnlocked = {
        id: `rdm_${Date.now()}`,
        code,
        rewardId: rewardDef.id,
        userId,
        businessId,
        status: 'CLAIMED',
        claimedAt: new Date().toISOString(),
        rewardTitle: rewardDef.title,
        reward: rewardDef,
        customer: { name: user.name, email: user.email },
      };
      db.redemptions.unshift(rewardUnlocked);
    }

    this.saveDb(db);

    const message = rewardUnlocked
      ? `Milestone reached! You completed ${milestoneTarget}/${milestoneTarget} visits at ${business.name}. Your reward voucher is unlocked.`
      : `Visit verified: Stamp credited. ${cycleStamps} of ${milestoneTarget} visits completed (${
          milestoneTarget - cycleStamps
        } remaining).`;

    return {
      verified: true,
      message,
      visit,
      totalStamps: cb.totalStamps,
      currentStamps: cycleStamps,
      milestoneTarget,
      rewardUnlocked,
      business: { name: business.name, slug: business.slug },
      customerBusiness: cb,
    };
  }

  // --- Redemptions & Anti-Fraud Verification ---
  public claimReward(userId: string, rewardId: string) {
    const db = this.getDb();
    const rwd = db.rewards.find((r: any) => r.id === rewardId) || db.rewards[0];
    const customer = db.users.find((u: any) => u.id === userId) || { name: 'Customer', email: 'guest@example.com' };
    const biz = db.businesses.find((b: any) => b.id === rwd?.businessId) || db.businesses[0];

    // Generate unique single-use code every time (e.g. SMASH-7K9A2, SMASH-3W8F1)
    const prefix = (biz.slug ? biz.slug.replace(/[^a-zA-Z]/g, '').substring(0, 5) : 'SMASH').toUpperCase();
    const entropy = Math.random().toString(36).substring(2, 7).toUpperCase();
    const code = `${prefix}-${entropy}`;

    const newRedemption = {
      id: `rdm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      code,
      rewardId: rwd?.id || `rwd_${Date.now()}`,
      userId,
      businessId: rwd?.businessId || biz.id,
      status: 'AVAILABLE',
      claimedAt: new Date().toISOString(),
      rewardTitle: rwd?.title || '1 Hour FREE Pickleball Court',
      reward: rwd || { title: '1 Hour FREE Pickleball Court' },
      customer: { name: customer.name, email: customer.email },
      business: { name: biz.name, slug: biz.slug },
    };

    if (!db.redemptions) db.redemptions = [];
    db.redemptions.unshift(newRedemption);
    this.saveDb(db);
    return newRedemption;
  }

  public verifyRedemption(businessId: string, code: string) {
    const db = this.getDb();
    if (!db.redemptions) db.redemptions = [];

    const cleanInput = (code || '').trim().toUpperCase();
    const strippedInput = cleanInput.replace(/[^A-Z0-9]/g, '');

    // Search by exact, stripped, or partial code match
    let rdm = db.redemptions.find((r: any) => {
      const rCode = (r.code || '').trim().toUpperCase();
      const rStripped = rCode.replace(/[^A-Z0-9]/g, '');
      return (
        rCode === cleanInput ||
        rStripped === strippedInput ||
        rCode.endsWith(cleanInput) ||
        cleanInput.endsWith(rCode)
      );
    });

    if (!rdm) {
      throw new Error(`Invalid code "${code}". No active unredeemed voucher was found.`);
    }

    // STRICT SINGLE-USE CHECK: Cannot be used a 2nd time!
    if (rdm.status === 'REDEEMED') {
      const redeemedTime = rdm.redeemedAt ? new Date(rdm.redeemedAt).toLocaleTimeString() : 'earlier';
      throw new Error(`Single-Use Fraud Block: Voucher (${rdm.code}) was ALREADY redeemed at ${redeemedTime}! Cannot be reused.`);
    }

    rdm.status = 'REDEEMED';
    rdm.redeemedAt = new Date().toISOString();
    this.saveDb(db);

    const customer = db.users.find((u: any) => u.id === rdm.userId) || rdm.customer || { name: 'Customer' };
    const rewardTitle = rdm.rewardTitle || rdm.reward?.title || '1 Free Reward';

    return {
      status: 'REDEEMED',
      code: rdm.code,
      customerName: customer.name || 'Customer',
      rewardTitle,
      redeemedAt: rdm.redeemedAt,
    };
  }

  public getCustomerRedemptions(userId: string) {
    const db = this.getDb();
    return db.redemptions
      .filter((r) => r.userId === userId)
      .map((r) => {
        const biz = db.businesses.find((b) => b.id === r.businessId);
        return {
          ...r,
          business: biz ? { name: biz.name, slug: biz.slug, logo: biz.logo } : null,
        };
      });
  }

  public getBusinessRedemptions(businessId: string) {
    const db = this.getDb();
    return db.redemptions.filter((r) => r.businessId === businessId);
  }

  // --- Loyalty Cards & Customer State ---
  public joinProgram(userId: string, businessId: string) {
    const db = this.getDb();
    let cb = db.customerBusinesses.find((c) => c.userId === userId && c.businessId === businessId);
    if (!cb) {
      cb = {
        id: `cb_${Date.now()}`,
        userId,
        businessId,
        totalVisits: 0,
        totalStamps: 0,
        totalPoints: 0,
        joinedAt: new Date().toISOString(),
        lastVisitAt: null,
      };
      db.customerBusinesses.push(cb);
      this.saveDb(db);
    }
    return cb;
  }

  public getCustomerLoyalty(userId: string) {
    const db = this.getDb();
    const customerLinks = db.customerBusinesses.filter((cb) => cb.userId === userId);

    return customerLinks.map((cb) => {
      const biz = db.businesses.find((b) => b.id === cb.businessId);
      const campaign = db.campaigns.find((c) => c.businessId === cb.businessId) || db.campaigns[0];
      const target = campaign?.rules?.[0]?.conditionValue || 10;
      const cycleStamps = cb.totalStamps % target === 0 && cb.totalStamps > 0 ? target : cb.totalStamps % target;
      const rewardTitle = campaign?.rewards?.[0]?.title || 'Milestone Reward';

      return {
        id: cb.id,
        businessId: cb.businessId,
        businessName: biz?.name || 'Local Venue',
        businessSlug: biz?.slug || 'venue',
        businessLogo: biz?.logo || null,
        industry: biz?.industry?.name || 'Local Commerce',
        activeCampaign: {
          name: campaign?.name || 'Loyalty Program',
          rewardTitle,
          type: campaign?.type || 'STAMP',
        },
        currentStamps: cycleStamps,
        targetVisits: target,
        totalVisits: cb.totalVisits,
        totalStamps: cb.totalStamps,
        cycleStamps,
        milestoneTarget: target,
        totalPoints: cb.totalPoints,
        joinedAt: cb.joinedAt,
        lastVisitAt: cb.lastVisitAt,
        unlockedRewards: db.redemptions.filter((r) => r.userId === userId && r.businessId === cb.businessId),
        business: biz,
        campaign,
      };
    });
  }

  // --- Campaigns Management ---
  public createCampaign(businessId: string, campaignData: any) {
    const db = this.getDb();
    const newCampaign = {
      id: `cmp_${Date.now()}`,
      businessId,
      name: campaignData.name,
      description: campaignData.description || '',
      type: campaignData.type || 'STAMP',
      status: 'ACTIVE',
      isRecurring: campaignData.isRecurring ?? true,
      rules: [
        {
          conditionType: campaignData.conditionType || 'STAMP_COUNT',
          conditionValue: campaignData.conditionValue || 10,
          rewardType: campaignData.rewardType || 'FREE_PRODUCT',
        },
      ],
      rewards: [
        {
          id: `rwd_${Date.now()}`,
          businessId,
          title: campaignData.rewardTitle || 'Reward',
          description: campaignData.rewardDescription || '',
          type: campaignData.rewardType || 'FREE_PRODUCT',
          value: campaignData.rewardValue || 'Standard',
          status: 'AVAILABLE',
        },
      ],
      createdAt: new Date().toISOString(),
    };
    db.campaigns.unshift(newCampaign);
    this.saveDb(db);
    return newCampaign;
  }

  public getCampaignsByBusiness(businessId: string) {
    const db = this.getDb();
    return db.campaigns.filter((c) => c.businessId === businessId);
  }

  // --- Analytics Engines ---
  public getBusinessAnalytics(businessId: string) {
    const db = this.getDb();
    const customers = db.customerBusinesses.filter((cb) => cb.businessId === businessId);
    const visits = db.visits.filter((v) => v.businessId === businessId);
    const campaigns = db.campaigns.filter((c) => c.businessId === businessId);
    const redemptions = db.redemptions.filter((r) => r.businessId === businessId);

    const totalStamps = customers.reduce((sum, c) => sum + (c.totalStamps || 0), 0);
    const pointsIssued = customers.reduce((sum, c) => sum + (c.totalPoints || 0), 0);
    const rewardsUnlocked = redemptions.length;
    const rewardsRedeemed = redemptions.filter((r) => r.status === 'REDEEMED').length;

    const visitActivities = visits.map((v: any) => {
      const cust = db.users.find((u: any) => u.id === v.userId) || v.user;
      const custName = cust?.name || 'Customer';
      return {
        id: v.id,
        type: 'VISIT',
        title: `${custName} Check-In`,
        subtitle: `Verified via ${v.verificationMethod || 'DYNAMIC_QR'} (+1 Stamp)`,
        time: v.createdAt,
        user: { name: custName, email: cust?.email },
        verificationMethod: v.verificationMethod || 'DYNAMIC_QR',
      };
    });

    const rewardActivities = redemptions.map((r: any) => {
      const cust = db.users.find((u: any) => u.id === r.userId) || r.customer;
      const custName = cust?.name || 'Customer';
      const isRedeemed = r.status === 'REDEEMED';
      return {
        id: r.id,
        type: 'REWARD',
        title: `${custName} - ${r.rewardTitle || r.reward?.title || 'Milestone Reward'}`,
        subtitle: isRedeemed ? `Redeemed Voucher: ${r.code}` : `Unlocked Voucher: ${r.code}`,
        time: r.redeemedAt || r.claimedAt || new Date().toISOString(),
        user: { name: custName, email: cust?.email },
        code: r.code,
        status: r.status,
      };
    });

    const recentActivity = [...visitActivities, ...rewardActivities].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const visitsByDay: { [key: string]: { visits: number; stamps: number; date: string; name: string } } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];
      visitsByDay[dateKey] = { visits: 0, stamps: 0, date: `${dayName} ${d.getDate()}`, name: dayName };
    }

    visits.forEach((v: any) => {
      const vDate = (v.createdAt || new Date().toISOString()).split('T')[0];
      if (visitsByDay[vDate]) {
        visitsByDay[vDate].visits += 1;
        visitsByDay[vDate].stamps += 1;
      } else {
        const todayKey = new Date().toISOString().split('T')[0];
        if (visitsByDay[todayKey]) {
          visitsByDay[todayKey].visits += 1;
          visitsByDay[todayKey].stamps += 1;
        }
      }
    });

    const visitsOverTime = Object.keys(visitsByDay).map((k) => ({
      date: visitsByDay[k].date,
      name: visitsByDay[k].name,
      visits: visitsByDay[k].visits,
      stamps: visitsByDay[k].stamps,
    }));

    const repeatCustomers = customers.filter((c) => (c.totalVisits || 0) > 1).length;
    const retentionRate = customers.length > 0
      ? Math.min(100, Math.round(((repeatCustomers || (customers.length > 0 ? 1 : 0)) / customers.length) * 100))
      : 84;

    const campaignBreakdown = campaigns.map((cmp: any) => {
      const cmpVisits = visits.filter((v: any) => v.campaignId === cmp.id);
      const cmpRedemptions = redemptions.filter((r: any) => r.rewardId === cmp.rewards?.[0]?.id || r.campaignId === cmp.id);
      const redeemed = cmpRedemptions.filter((r: any) => r.status === 'REDEEMED').length;
      return {
        id: cmp.id,
        name: cmp.name,
        type: cmp.type,
        target: cmp.rules?.[0]?.conditionValue || 10,
        rewardTitle: cmp.rewards?.[0]?.title || 'Loyalty Reward',
        totalVisits: cmpVisits.length,
        totalUnlocked: cmpRedemptions.length,
        totalRedeemed: redeemed,
        conversionRate: cmpRedemptions.length > 0 ? Math.round((redeemed / cmpRedemptions.length) * 100) : 0,
      };
    });

    const hourlyDistribution = [
      { hour: '8 AM', visits: Math.floor(visits.length * 0.1) },
      { hour: '11 AM', visits: Math.floor(visits.length * 0.15) },
      { hour: '2 PM', visits: Math.floor(visits.length * 0.15) },
      { hour: '5 PM', visits: Math.floor(visits.length * 0.25) },
      { hour: '7 PM (Peak)', visits: Math.ceil(visits.length * 0.35) || (visits.length > 0 ? 1 : 0) },
      { hour: '9 PM', visits: Math.floor(visits.length * 0.1) },
    ];

    return {
      summary: {
        totalCustomers: customers.length,
        todayVisits: visits.length,
        monthlyVisits: visits.length,
        totalStamps,
        pointsIssued,
        rewardsUnlocked,
        rewardsRedeemed,
        activeCampaigns: campaigns.filter((c) => c.status === 'ACTIVE').length,
        retentionRate,
        repeatCustomers,
        avgVisitsPerMember: customers.length > 0 ? (visits.length / customers.length).toFixed(1) : '1.0',
      },
      recentActivity,
      visits,
      visitsOverTime,
      chartData: visitsOverTime,
      campaignBreakdown,
      hourlyDistribution,
    };
  }

  public getBusinessVisits(businessId: string) {
    const db = this.getDb();
    return db.visits
      .filter((v: any) => v.businessId === businessId)
      .map((v: any) => {
        const cust = db.users.find((u: any) => u.id === v.userId) || v.user;
        return {
          ...v,
          user: cust ? { name: cust.name, email: cust.email } : { name: 'Customer' },
        };
      })
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getSubscription(businessId: string) {
    const db = this.getDb();
    if (!db.subscriptions) db.subscriptions = [];
    let sub = db.subscriptions.find((s: any) => s.businessId === businessId);
    if (!sub) {
      sub = {
        id: `sub_${Date.now()}`,
        businessId,
        planId: 'plan_growth',
        status: 'ACTIVE',
        billingCycle: 'MONTHLY',
        amount: 999,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        paymentMethod: 'UPI AutoPay (••rohan@oksbi)',
      };
      db.subscriptions.push(sub);
      this.saveDb(db);
    }
    const plan = db.plans.find((p: any) => p.id === sub.planId) || db.plans[1];
    return {
      ...sub,
      plan,
      planId: plan.id,
    };
  }

  public getInvoices(businessId: string) {
    const db = this.getDb();
    if (!db.invoices) db.invoices = [];
    return db.invoices.filter((i: any) => i.businessId === businessId);
  }

  public upgradeSubscription(businessId: string, planId: string, billingCycle: 'MONTHLY' | 'ANNUAL' = 'MONTHLY') {
    const db = this.getDb();
    if (!db.subscriptions) db.subscriptions = [];
    const plan = db.plans.find((p: any) => p.id === planId) || db.plans[1];
    const amount = billingCycle === 'ANNUAL' ? (plan.annualPrice || plan.price * 10) : plan.price;

    let sub = db.subscriptions.find((s: any) => s.businessId === businessId);
    if (sub) {
      sub.planId = plan.id;
      sub.status = 'ACTIVE';
      sub.billingCycle = billingCycle;
      sub.amount = amount;
      sub.currentPeriodStart = new Date().toISOString();
      sub.currentPeriodEnd = new Date(Date.now() + (billingCycle === 'ANNUAL' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString();
    } else {
      sub = {
        id: `sub_${Date.now()}`,
        businessId,
        planId: plan.id,
        status: 'ACTIVE',
        billingCycle,
        amount,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + (billingCycle === 'ANNUAL' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        paymentMethod: 'UPI AutoPay (••rohan@oksbi)',
      };
      db.subscriptions.push(sub);
    }

    // Add new paid invoice record
    if (!db.invoices) db.invoices = [];
    const newInvoice = {
      id: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      businessId,
      planName: `${plan.name} Plan (${billingCycle})`,
      amount,
      status: 'PAID',
      date: new Date().toISOString(),
      paymentMethod: 'Instant Online Payment (Razorpay)',
    };
    db.invoices.unshift(newInvoice);

    this.saveDb(db);

    return {
      success: true,
      subscription: {
        ...sub,
        plan,
        planId: plan.id,
      },
      invoice: newInvoice,
    };
  }

  public getAdminDashboard() {
    const db = this.getDb();
    const businesses = db.businesses || [];
    const users = db.users || [];
    const customers = users.filter((u: any) => u.role === 'CUSTOMER');
    const customerBusinesses = db.customerBusinesses || [];
    const visits = db.visits || [];
    const redemptions = db.redemptions || [];
    const subscriptions = db.subscriptions || [];

    const totalBusinesses = businesses.length;
    const activeBusinesses = businesses.filter((b: any) => b.status === 'ACTIVE').length;
    const pendingBusinesses = businesses.filter((b: any) => b.status === 'PENDING').length;
    const totalCustomers = customers.length;
    const totalVisits = visits.length;
    const totalStamps = customerBusinesses.reduce((sum: number, c: any) => sum + (c.totalStamps || 0), 0) || visits.length;
    const totalRewards = redemptions.length;
    const totalRedemptions = redemptions.filter((r: any) => r.status === 'REDEEMED').length;

    // Calculate dynamic normalized MRR from subscriptions or active businesses
    let mrr = 0;
    if (subscriptions.length > 0) {
      mrr = subscriptions
        .filter((s: any) => s.status === 'ACTIVE')
        .reduce((sum: number, s: any) => {
          if (s.monthlyEquivalent) return sum + s.monthlyEquivalent;
          const plan = db.plans.find((p: any) => p.id === s.planId);
          const isAnnual = s.billingCycle === 'ANNUAL';
          const monthlyRate = isAnnual
            ? (plan?.annualPrice || Math.round((s.amount || 999) / 12) || 799)
            : (plan?.price || s.amount || 999);
          return sum + monthlyRate;
        }, 0);
    } else {
      mrr = activeBusinesses * 999;
    }
    const arr = mrr * 12;

    const summary = {
      totalBusinesses,
      activeBusinesses,
      pendingBusinesses,
      totalCustomers,
      totalVisits,
      totalStamps,
      totalRewards,
      totalRedemptions,
      mrr,
      arr,
      activeSubscriptions: activeBusinesses,
    };

    // Dynamic 6-month growth data for Recharts AreaChart
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const growthData = months.map((month, idx) => {
      const multiplier = (idx + 1) / months.length;
      return {
        month,
        customers: Math.max(1, Math.round(totalCustomers * multiplier) || (idx + 2)),
        visits: Math.max(0, Math.round(totalVisits * multiplier) || (idx * 3)),
        businesses: Math.max(1, Math.min(totalBusinesses, idx + 1)),
        stamps: Math.max(0, Math.round(totalStamps * multiplier) || (idx * 4)),
        revenue: Math.round(mrr * multiplier) || ((idx + 1) * 999),
      };
    });

    // Top venues leaderboard
    const topVenues = businesses.map((b: any) => {
      const bVisits = visits.filter((v: any) => v.businessId === b.id).length;
      const bCustomers = customerBusinesses.filter((cb: any) => cb.businessId === b.id).length;
      const bStamps = customerBusinesses
        .filter((cb: any) => cb.businessId === b.id)
        .reduce((s: number, c: any) => s + (c.totalStamps || 0), 0);
      return {
        id: b.id,
        name: b.name,
        slug: b.slug,
        city: b.city,
        status: b.status,
        industry: b.industry?.name || 'Local Commerce',
        totalVisits: bVisits,
        totalCustomers: bCustomers,
        totalStamps: bStamps,
      };
    }).sort((a: any, b: any) => b.totalVisits - a.totalVisits);

    // Recent platform activities
    const recentActivities = [
      ...visits.slice(0, 5).map((v: any) => ({
        id: v.id,
        type: 'VISIT',
        title: `${v.user?.name || 'Customer'} verified at ${v.business?.name || 'Venue'}`,
        subtitle: `+1 Stamp awarded via Dynamic QR`,
        time: v.createdAt,
      })),
      ...redemptions.slice(0, 5).map((r: any) => ({
        id: r.id,
        type: 'REWARD',
        title: `${r.customer?.name || 'Customer'} redeemed ${r.rewardTitle || 'Reward'}`,
        subtitle: `Voucher: ${r.code} (${r.status})`,
        time: r.redeemedAt || r.claimedAt,
      })),
    ].sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

    return {
      summary,
      growthData,
      topVenues,
      recentActivities,
      ...summary,
      businesses,
      users,
      industries: db.industries,
      pendingList: businesses.filter((b: any) => b.status === 'PENDING'),
    };
  }

  public updateBusinessStatus(id: string, status: string) {
    const db = this.getDb();
    const b = db.businesses?.find((x: any) => x.id === id);
    if (b) {
      b.status = status;
      this.saveDb(db);
    }
    return b;
  }

  public getAdminSubscriptions() {
    const db = this.getDb();
    const businesses = db.businesses || [];
    const plans = db.plans || [];
    if (!db.subscriptions) db.subscriptions = [];

    // Ensure seed businesses have subscriptions
    const defaults: Record<string, any> = {
      biz_smashzone: {
        planId: 'plan_growth',
        status: 'ACTIVE',
        billingCycle: 'MONTHLY',
        amount: 999,
        monthlyEquivalent: 999,
        savingsPerYear: 0,
        paymentMethod: 'UPI AutoPay (••rohan@oksbi)',
        periodDaysAgo: 5,
        periodDaysLeft: 25,
      },
      biz_cafeartisan: {
        planId: 'plan_growth',
        status: 'ACTIVE',
        billingCycle: 'ANNUAL',
        amount: 9588,
        monthlyEquivalent: 799,
        savingsPerYear: 2400,
        paymentMethod: 'HDFC Corp Auto-Debit (••priya@hdfc)',
        periodDaysAgo: 45,
        periodDaysLeft: 320,
      },
      biz_aurora: {
        planId: 'plan_pro',
        status: 'ACTIVE',
        billingCycle: 'ANNUAL',
        amount: 19188,
        monthlyEquivalent: 1599,
        savingsPerYear: 4800,
        paymentMethod: 'ICICI Business Card (••4421)',
        periodDaysAgo: 20,
        periodDaysLeft: 345,
      },
      biz_powerbox: {
        planId: 'plan_starter',
        status: 'TRIAL',
        billingCycle: 'MONTHLY',
        amount: 499,
        monthlyEquivalent: 499,
        savingsPerYear: 0,
        paymentMethod: '14-Day Free Trial',
        periodDaysAgo: 2,
        periodDaysLeft: 12,
      },
    };

    let updated = false;
    for (const [bizId, def] of Object.entries(defaults)) {
      const existing = db.subscriptions.find((s: any) => s.businessId === bizId);
      if (!existing) {
        db.subscriptions.push({
          id: `sub_${bizId}`,
          businessId: bizId,
          planId: def.planId,
          status: def.status,
          billingCycle: def.billingCycle,
          amount: def.amount,
          monthlyEquivalent: def.monthlyEquivalent,
          savingsPerYear: def.savingsPerYear,
          currentPeriodStart: new Date(Date.now() - def.periodDaysAgo * 86400000).toISOString(),
          currentPeriodEnd: new Date(Date.now() + def.periodDaysLeft * 86400000).toISOString(),
          cancelAtPeriodEnd: false,
          paymentMethod: def.paymentMethod,
        });
        updated = true;
      }
    }
    if (updated) {
      this.saveDb(db);
    }

    // Build enriched subscribers list
    const subscribers = db.subscriptions.map((sub: any) => {
      const biz = businesses.find((b: any) => b.id === sub.businessId) || {
        name: 'Venue Tenant',
        slug: 'venue',
        city: 'India',
        email: 'contact@venue.io',
      };
      const plan = plans.find((p: any) => p.id === sub.planId) || plans[1] || {
        name: 'Growth',
        code: 'GROWTH',
        price: 999,
        annualPrice: 799,
      };

      const isAnnual = sub.billingCycle === 'ANNUAL';
      const baseMonthlyPrice = plan.price || 999;
      const discountedMonthlyPrice = plan.annualPrice || Math.round(baseMonthlyPrice * 0.8);
      const effectiveMonthly = isAnnual ? discountedMonthlyPrice : baseMonthlyPrice;
      const billedAmount = isAnnual ? (discountedMonthlyPrice * 12) : baseMonthlyPrice;
      const annualSavings = isAnnual ? ((baseMonthlyPrice - discountedMonthlyPrice) * 12) : 0;
      const discountPercent = isAnnual ? 20 : 0;

      return {
        id: sub.id,
        businessId: sub.businessId,
        businessName: biz.name,
        businessSlug: biz.slug,
        businessCity: biz.city,
        businessEmail: biz.email,
        businessOwner: biz.owner?.name || (biz.name?.includes('Smash') ? 'Rohan Mehta' : biz.name?.includes('Artisan') ? 'Priya Sharma' : biz.name?.includes('Glamour') ? 'Anita Deshmukh' : 'Vikram Malhotra'),
        industry: biz.industry?.name || 'Local Commerce',
        planId: plan.id,
        planName: plan.name,
        planCode: plan.code,
        status: sub.status || 'ACTIVE',
        billingCycle: sub.billingCycle || 'MONTHLY',
        isAnnual,
        baseMonthlyPrice,
        discountedMonthlyPrice,
        effectiveMonthlyPrice: effectiveMonthly,
        billedAmount,
        annualSavings,
        discountPercent,
        currentPeriodStart: sub.currentPeriodStart,
        currentPeriodEnd: sub.currentPeriodEnd,
        paymentMethod: sub.paymentMethod || 'UPI AutoPay',
      };
    });

    const activeList = subscribers.filter((s: any) => s.status === 'ACTIVE');
    const annualList = activeList.filter((s: any) => s.isAnnual);
    const monthlyList = activeList.filter((s: any) => !s.isAnnual);
    const trialList = subscribers.filter((s: any) => s.status === 'TRIAL' || s.status === 'PENDING');

    const totalMRR = activeList.reduce((sum: number, s: any) => sum + s.effectiveMonthlyPrice, 0);
    const totalARR = activeList.reduce((sum: number, s: any) => sum + (s.effectiveMonthlyPrice * 12), 0);
    const totalAnnualSavingsGranted = annualList.reduce((sum: number, s: any) => sum + s.annualSavings, 0);
    const annualAdoptionRate = activeList.length > 0 ? Math.round((annualList.length / activeList.length) * 100) : 0;
    const arpu = activeList.length > 0 ? Math.round(totalMRR / activeList.length) : 0;

    // Plans breakdown
    const planBreakdown = plans.map((p: any) => {
      const matchingActive = activeList.filter((s: any) => s.planId === p.id);
      return {
        id: p.id,
        name: p.name,
        code: p.code,
        price: p.price,
        annualPrice: p.annualPrice || Math.round(p.price * 0.8),
        subscribersCount: matchingActive.length,
        annualCount: matchingActive.filter((s: any) => s.isAnnual).length,
        monthlyCount: matchingActive.filter((s: any) => !s.isAnnual).length,
        mrrContribution: matchingActive.reduce((sum: number, s: any) => sum + s.effectiveMonthlyPrice, 0),
      };
    });

    // Billing cycle comparison metrics
    const cadenceBreakdown = {
      annual: {
        label: 'Annual (20% OFF)',
        count: annualList.length,
        percentage: annualAdoptionRate,
        mrrContribution: annualList.reduce((sum: number, s: any) => sum + s.effectiveMonthlyPrice, 0),
        arrContribution: annualList.reduce((sum: number, s: any) => sum + (s.effectiveMonthlyPrice * 12), 0),
        totalSavingsGiven: totalAnnualSavingsGranted,
        discountPerMonthPercent: 20,
      },
      monthly: {
        label: 'Monthly Standard',
        count: monthlyList.length,
        percentage: activeList.length > 0 ? (100 - annualAdoptionRate) : 0,
        mrrContribution: monthlyList.reduce((sum: number, s: any) => sum + s.effectiveMonthlyPrice, 0),
        arrContribution: monthlyList.reduce((sum: number, s: any) => sum + (s.effectiveMonthlyPrice * 12), 0),
        totalSavingsGiven: 0,
        discountPerMonthPercent: 0,
      },
    };

    // 6-Month MRR split by cadence for charts
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const cadenceTrend = months.map((m, idx) => {
      const mult = (idx + 1) / months.length;
      return {
        month: m,
        annualMrr: Math.round(cadenceBreakdown.annual.mrrContribution * mult) || ((idx + 1) * 400),
        monthlyMrr: Math.round(cadenceBreakdown.monthly.mrrContribution * mult) || ((idx + 1) * 200),
        totalMrr: Math.round(totalMRR * mult) || ((idx + 1) * 600),
      };
    });

    return {
      summary: {
        totalSubscribers: subscribers.length,
        activeSubscribers: activeList.length,
        annualSubscribers: annualList.length,
        monthlySubscribers: monthlyList.length,
        trialSubscribers: trialList.length,
        annualAdoptionRate,
        totalMRR,
        totalARR,
        totalAnnualSavingsGranted,
        arpu,
      },
      subscribers,
      annualList,
      monthlyList,
      trialList,
      planBreakdown,
      cadenceBreakdown,
      cadenceTrend,
      invoices: db.invoices || [],
    };
  }

  public getAdminPlatformAnalytics() {
    const db = this.getDb();
    const businesses = db.businesses || [];
    const users = db.users || [];
    const customers = users.filter((u: any) => u.role === 'CUSTOMER');
    const visits = db.visits || [];
    const customerBusinesses = db.customerBusinesses || [];
    const redemptions = db.redemptions || [];
    const industries = db.industries || [];

    const totalBusinesses = businesses.length;
    const totalCustomers = customers.length;
    const totalVisits = visits.length;
    const totalStamps = customerBusinesses.reduce((s: number, c: any) => s + (c.totalStamps || 0), 0) || visits.length;
    const totalRewards = redemptions.length;
    const totalRedemptions = redemptions.filter((r: any) => r.status === 'REDEEMED').length;

    const repeatCustomers = customerBusinesses.filter((cb: any) => (cb.totalVisits || 0) > 1).length;
    const repeatRate = customerBusinesses.length > 0 ? Math.round((repeatCustomers / customerBusinesses.length) * 100) : 67;
    const redemptionRate = totalRewards > 0 ? Math.round((totalRedemptions / totalRewards) * 100) : 40;
    const avgVisitsPerCustomer = totalCustomers > 0 ? (totalVisits / totalCustomers).toFixed(1) : '3.4';
    const avgStampsPerVisit = totalVisits > 0 ? (totalStamps / totalVisits).toFixed(1) : '1.1';

    // 6-Month monthly volume
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const monthlyVolume = months.map((month, idx) => {
      const mult = (idx + 1) / months.length;
      return {
        month,
        visits: Math.max(2, Math.round(totalVisits * mult)) || (idx * 4 + 3),
        stamps: Math.max(3, Math.round(totalStamps * mult)) || (idx * 5 + 4),
        redemptions: Math.max(1, Math.round(totalRedemptions * mult)) || (idx + 1),
        patrons: Math.max(2, Math.round(totalCustomers * mult)) || (idx + 2),
      };
    });

    // Industry Distribution
    const industryStats = industries.map((ind: any) => {
      const bizInInd = businesses.filter((b: any) => b.industryId === ind.id || b.industry?.id === ind.id || b.industry?.slug === ind.slug);
      const bizIds = bizInInd.map((b: any) => b.id);
      const indVisits = visits.filter((v: any) => bizIds.includes(v.businessId)).length;
      const indStamps = customerBusinesses.filter((cb: any) => bizIds.includes(cb.businessId)).reduce((sum: number, c: any) => sum + (c.totalStamps || 0), 0);
      const indRedemptions = redemptions.filter((r: any) => bizIds.includes(r.businessId) && r.status === 'REDEEMED').length;

      return {
        id: ind.id,
        name: ind.name,
        slug: ind.slug,
        icon: ind.icon || 'Store',
        businessCount: bizInInd.length,
        visits: indVisits || (ind.slug === 'sports' ? 8 : ind.slug === 'cafes' ? 4 : 2),
        stamps: indStamps || (ind.slug === 'sports' ? 9 : ind.slug === 'cafes' ? 5 : 2),
        redemptions: indRedemptions || (ind.slug === 'sports' ? 1 : 1),
        percentage: 0,
      };
    });

    const totalIndVisits = industryStats.reduce((s: number, i: any) => s + i.visits, 0) || 1;
    industryStats.forEach((ind: any) => {
      ind.percentage = Math.round((ind.visits / totalIndVisits) * 100);
    });

    // Weekday distribution
    const weekdays = [
      { day: 'Mon', visits: 1, stamps: 1, peak: 'Morning Brew' },
      { day: 'Tue', visits: 2, stamps: 2, peak: 'Afternoon Workout' },
      { day: 'Wed', visits: 2, stamps: 2, peak: 'Evening Salon' },
      { day: 'Thu', visits: 3, stamps: 3, peak: 'Evening Match' },
      { day: 'Fri', visits: 5, stamps: 6, peak: 'Night Court Rush' },
      { day: 'Sat', visits: 8, stamps: 9, peak: 'Weekend Sports Peak' },
      { day: 'Sun', visits: 7, stamps: 8, peak: 'Weekend Family Tour' },
    ];

    // Peak time slots
    const timeSlots = [
      { slot: 'Morning (8 AM - 12 PM)', share: 22, visits: 6, focus: 'Artisan Cafe & Coffee Brews' },
      { slot: 'Afternoon (12 PM - 4 PM)', share: 18, visits: 5, focus: 'Salon & Spa Pampering' },
      { slot: 'Evening Prime (4 PM - 8 PM)', share: 38, visits: 11, focus: 'Pickleball Courts & Sports Arenas' },
      { slot: 'Night Glow (8 PM - 11 PM)', share: 22, visits: 6, focus: 'Box Cricket & Evening Matches' },
    ];

    // Conversion Funnel
    const funnel = [
      { stage: 'Registered Patrons', count: totalCustomers, rate: '100%', color: '#a855f7' },
      { stage: 'First Verified Check-In', count: Math.max(1, Math.round(totalCustomers * 0.85)), rate: '85%', color: '#6366f1' },
      { stage: 'Repeat Loyalty Visits (2+)', count: Math.max(1, Math.round(totalCustomers * 0.67)), rate: '67%', color: '#38bdf8' },
      { stage: 'Reward Milestone Reached', count: Math.max(1, totalRewards), rate: '55%', color: '#14b8a6' },
      { stage: 'Voucher Burned & Redeemed', count: Math.max(1, totalRedemptions), rate: `${redemptionRate}%`, color: '#10b981' },
    ];

    // Top Loyal Patrons across the whole platform
    const topLoyalCustomers = customers.map((c: any) => {
      const userCB = customerBusinesses.filter((cb: any) => cb.userId === c.id);
      const uVisits = userCB.reduce((s: number, cb: any) => s + (cb.totalVisits || 0), 0) || 1;
      const uStamps = userCB.reduce((s: number, cb: any) => s + (cb.totalStamps || 0), 0) || 2;
      const uRedemptions = redemptions.filter((r: any) => r.userId === c.id && r.status === 'REDEEMED').length;
      const topBizId = userCB[0]?.businessId || businesses[0]?.id;
      const topBiz = businesses.find((b: any) => b.id === topBizId) || businesses[0];

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone || '+91 98765 43210',
        totalVisits: uVisits,
        totalStamps: uStamps,
        redemptionsCount: uRedemptions,
        favoriteVenue: topBiz?.name || 'Smash Point Pickleball',
        industry: topBiz?.industry?.name || 'Sports',
      };
    }).sort((a: any, b: any) => b.totalVisits - a.totalVisits);

    return {
      summary: {
        totalVisits,
        totalStamps,
        totalCustomers,
        totalBusinesses,
        totalRewards,
        totalRedemptions,
        redemptionRate,
        repeatRate,
        avgVisitsPerCustomer,
        avgStampsPerVisit,
      },
      monthlyVolume,
      industryStats,
      weekdays,
      timeSlots,
      funnel,
      topLoyalCustomers,
    };
  }

  public getPlatformSettings(): PlatformSettings {
    const db = this.getDb();
    if (!db.settings) {
      db.settings = { ...INITIAL_DATA.settings! };
      this.saveDb(db);
    }
    return db.settings;
  }

  public updatePlatformSettings(updates: Partial<PlatformSettings>): PlatformSettings {
    const db = this.getDb();
    if (!db.settings) {
      db.settings = { ...INITIAL_DATA.settings! };
    }
    db.settings = {
      ...db.settings,
      ...updates,
      broadcast: updates.broadcast ? { ...db.settings.broadcast, ...updates.broadcast } : db.settings.broadcast,
    };
    this.saveDb(db);
    return db.settings;
  }

  public getAllVisitsEnriched() {
    const db = this.getDb();
    const visits = db.visits || [];
    const users = db.users || [];
    const businesses = db.businesses || [];
    const campaigns = db.campaigns || [];

    return visits.map((v: any) => {
      const user = users.find((u: any) => u.id === v.userId) || v.user || { name: 'Customer', email: 'guest@goldstamp.io' };
      const biz = businesses.find((b: any) => b.id === v.businessId) || v.business || { name: 'Venue' };
      const cmp = campaigns.find((c: any) => c.id === v.campaignId) || v.campaign || { name: 'Standard Check-in' };

      return {
        ...v,
        user,
        business: biz,
        campaign: cmp,
      };
    });
  }
}

export const mockStore = new MockDataStore();

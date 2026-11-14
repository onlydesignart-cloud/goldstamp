export const APP_CONFIG = {
  name: 'Gold Stamp',
  tagline: 'Modern Multi-tenant Digital Loyalty & Stamp Cloud',
  version: '1.0.0',
  defaultQrExpirySeconds: 60,
  defaultCooldownMinutes: 60,
  initialIndustries: [
    { name: 'Café', slug: 'cafe', icon: 'Coffee' },
    { name: 'Restaurant', slug: 'restaurant', icon: 'Utensils' },
    { name: 'Pickleball', slug: 'pickleball', icon: 'Trophy' },
    { name: 'Box Cricket', slug: 'box-cricket', icon: 'Shield' },
    { name: 'Gym & Fitness', slug: 'gym', icon: 'Dumbbell' },
    { name: 'Salon & Spa', slug: 'salon', icon: 'Sparkles' },
    { name: 'Gaming Zone', slug: 'gaming-zone', icon: 'Gamepad2' },
    { name: 'Car Wash', slug: 'car-wash', icon: 'Car' },
    { name: 'Sports & Turf', slug: 'sports', icon: 'Activity' },
    { name: 'Entertainment', slug: 'entertainment', icon: 'Film' },
    { name: 'Other', slug: 'other', icon: 'Store' }
  ],
  subscriptionPlans: [
    {
      name: 'Starter',
      code: 'STARTER',
      price: 499,
      currency: 'INR',
      interval: 'MONTHLY' as const,
      maxStaff: 2,
      maxBranches: 1,
      maxCampaigns: 2,
      maxCustomers: 500,
      features: [
        'Up to 500 customers',
        '2 active stamp/visit campaigns',
        'Dynamic QR generation',
        '1 branch & 2 staff accounts',
        'Basic visit analytics'
      ]
    },
    {
      name: 'Growth',
      code: 'GROWTH',
      price: 999,
      currency: 'INR',
      interval: 'MONTHLY' as const,
      maxStaff: 5,
      maxBranches: 3,
      maxCampaigns: 5,
      maxCustomers: 2500,
      features: [
        'Up to 2,500 customers',
        '5 active campaigns (Stamps + Points)',
        '3 branches & 5 staff accounts',
        'WhatsApp & Email alerts',
        'Advanced customer retention charts',
        'Fraud protection & custom cooldown'
      ]
    },
    {
      name: 'Pro',
      code: 'PRO',
      price: 1999,
      currency: 'INR',
      interval: 'MONTHLY' as const,
      maxStaff: 15,
      maxBranches: 10,
      maxCampaigns: 20,
      maxCustomers: 10000,
      features: [
        'Up to 10,000 customers',
        'Unlimited active campaigns',
        '10 branches & 15 staff logins',
        'Full analytics suite & export',
        'Custom branding & white-label kiosk',
        'Dedicated account manager'
      ]
    },
    {
      name: 'Enterprise',
      code: 'ENTERPRISE',
      price: 4999,
      currency: 'INR',
      interval: 'MONTHLY' as const,
      maxStaff: 100,
      maxBranches: 50,
      maxCampaigns: 100,
      maxCustomers: 100000,
      features: [
        'Unlimited customers & branches',
        'POS & Webhook API integrations',
        'Custom domain support',
        '99.9% uptime SLA',
        '24/7 priority support'
      ]
    }
  ]
};

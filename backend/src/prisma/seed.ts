import { PrismaClient, UserRole, UserStatus, BusinessStatus, CampaignType, CampaignStatus, RewardType, RewardStatus, SubscriptionStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import { APP_CONFIG } from '@goldstamp/config';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Gold Stamp...');

  // Clean existing data in reverse order of foreign keys
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.rewardRedemption.deleteMany();
  await prisma.pointTransaction.deleteMany();
  await prisma.stampTransaction.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.customerBusiness.deleteMany();
  await prisma.qRCode.deleteMany();
  await prisma.campaignRule.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.businessStaff.deleteMany();
  await prisma.businessBranch.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.business.deleteMany();
  await prisma.industry.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('admin123', 10);
  const ownerPasswordHash = await bcrypt.hash('owner123', 10);
  const customerPasswordHash = await bcrypt.hash('customer123', 10);
  const staffPasswordHash = await bcrypt.hash('staff123', 10);

  // 1. Create Super Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Platform Super Admin',
      email: 'admin@example.com',
      phone: '+919876543210',
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`✅ Super Admin created: ${admin.email}`);

  // 2. Create Industries
  const industryMap = new Map<string, string>();
  for (const ind of APP_CONFIG.initialIndustries) {
    const created = await prisma.industry.create({
      data: {
        name: ind.name,
        slug: ind.slug,
        icon: ind.icon,
        isActive: true,
      },
    });
    industryMap.set(ind.slug, created.id);
  }
  console.log(`✅ ${industryMap.size} Industries seeded.`);

  // 3. Create Subscription Plans
  const planMap = new Map<string, string>();
  for (const p of APP_CONFIG.subscriptionPlans) {
    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: p.name,
        code: p.code,
        price: p.price,
        currency: p.currency,
        interval: p.interval,
        maxStaff: p.maxStaff,
        maxBranches: p.maxBranches,
        maxCampaigns: p.maxCampaigns,
        maxCustomers: p.maxCustomers,
        features: JSON.stringify(p.features),
        isActive: true,
      },
    });
    planMap.set(p.code, plan.id);
  }
  console.log(`✅ ${planMap.size} Subscription Plans seeded.`);

  // 4. Create Business Owners & Businesses
  // Business A: SmashZone Pickleball
  const smashOwner = await prisma.user.create({
    data: {
      name: 'Rohan Mehta',
      email: 'owner@smashzone.com',
      phone: '+919900112233',
      passwordHash: ownerPasswordHash,
      role: UserRole.BUSINESS_OWNER,
      status: UserStatus.ACTIVE,
    },
  });

  const smashBusiness = await prisma.business.create({
    data: {
      name: 'SmashZone Pickleball Arena',
      slug: 'smashzone-pickleball',
      logo: 'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?auto=format&fit=crop&w=300&q=80',
      coverImage: '/images/pickleball-arena.jpg',
      description: 'Premier indoor & outdoor pickleball courts with tournament-grade lighting and pro coaching.',
      industryId: industryMap.get('pickleball') || industryMap.get('sports')!,
      ownerId: smashOwner.id,
      phone: '+919900112233',
      email: 'contact@smashzone.com',
      website: 'https://smashzone.example.com',
      address: 'Plot 42, Vesu Sports Complex',
      city: 'Surat',
      state: 'Gujarat',
      country: 'India',
      pincode: '395007',
      status: BusinessStatus.ACTIVE,
      cooldownMinutes: 30,
    },
  });

  // Assign Growth subscription to SmashZone
  await prisma.subscription.create({
    data: {
      businessId: smashBusiness.id,
      planId: planMap.get('GROWTH')!,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Branches for SmashZone
  const branch1 = await prisma.businessBranch.create({
    data: {
      businessId: smashBusiness.id,
      name: 'Vesu Main Courts',
      city: 'Surat',
      address: 'Plot 42, Vesu Canal Road',
      phone: '+919900112233',
    },
  });

  await prisma.businessBranch.create({
    data: {
      businessId: smashBusiness.id,
      name: 'Adajan Arena',
      city: 'Surat',
      address: 'Near Riverfront Walkway',
      phone: '+919900112244',
    },
  });

  // Staff for SmashZone
  const staffUser = await prisma.user.create({
    data: {
      name: 'Karan Dave (Staff)',
      email: 'staff@smashzone.com',
      phone: '+919900112255',
      passwordHash: staffPasswordHash,
      role: UserRole.BUSINESS_STAFF,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.businessStaff.create({
    data: {
      businessId: smashBusiness.id,
      userId: staffUser.id,
      role: UserRole.BUSINESS_STAFF,
      branchId: branch1.id,
    },
  });

  // Campaign 1: SmashZone 10 visits -> 1 Hour FREE
  const smashCampaign = await prisma.campaign.create({
    data: {
      businessId: smashBusiness.id,
      name: 'Play 10 Hours → Get 1 Hour FREE',
      description: 'Visit SmashZone 10 times in a month to unlock 1 full court hour completely free!',
      type: CampaignType.VISIT,
      status: CampaignStatus.ACTIVE,
      isRecurring: true,
      rules: {
        create: [
          {
            conditionType: 'VISIT_COUNT',
            conditionValue: 10,
            rewardType: RewardType.FREE_SERVICE,
            rewardValue: '1_HOUR_COURT',
          },
        ],
      },
      rewards: {
        create: [
          {
            businessId: smashBusiness.id,
            title: '1 Hour FREE Pickleball Court',
            description: 'Valid on any weekday or weekend slot with advanced reservation.',
            type: RewardType.FREE_SERVICE,
            value: '1 Hour Free',
            status: RewardStatus.AVAILABLE,
          },
        ],
      },
    },
  });

  // Business B: Artisan Roastery & Café
  const cafeOwner = await prisma.user.create({
    data: {
      name: 'Ananya Sen',
      email: 'owner@cafeartisan.com',
      phone: '+919811223344',
      passwordHash: ownerPasswordHash,
      role: UserRole.BUSINESS_OWNER,
      status: UserStatus.ACTIVE,
    },
  });

  const cafeBusiness = await prisma.business.create({
    data: {
      name: 'Artisan Roastery & Café',
      slug: 'artisan-roastery-cafe',
      logo: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=300&q=80',
      coverImage: '/images/coffee-shop.jpg',
      description: 'Artisanal micro-roastery serving single-origin espresso, sourdough toasts, and cold brew.',
      industryId: industryMap.get('cafe')!,
      ownerId: cafeOwner.id,
      phone: '+919811223344',
      email: 'hello@artisanroastery.com',
      address: '12 Indiranagar 100ft Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      status: BusinessStatus.ACTIVE,
      cooldownMinutes: 60,
    },
  });

  await prisma.subscription.create({
    data: {
      businessId: cafeBusiness.id,
      planId: planMap.get('STARTER')!,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const cafeCampaign = await prisma.campaign.create({
    data: {
      businessId: cafeBusiness.id,
      name: 'Coffee Lover Stamps (5 Stamps → Free Brew)',
      description: 'Buy 5 handcrafted coffees and enjoy your 6th cup on the house!',
      type: CampaignType.STAMP,
      status: CampaignStatus.ACTIVE,
      isRecurring: true,
      rules: {
        create: [
          {
            conditionType: 'STAMP_COUNT',
            conditionValue: 5,
            rewardType: RewardType.FREE_PRODUCT,
            rewardValue: 'FREE_COFFEE',
          },
        ],
      },
      rewards: {
        create: [
          {
            businessId: cafeBusiness.id,
            title: 'Free Handcrafted Coffee',
            description: 'Choose any hot or iced latte, cappuccino, or cold brew.',
            type: RewardType.FREE_PRODUCT,
            value: 'Free Coffee',
            status: RewardStatus.AVAILABLE,
          },
        ],
      },
    },
  });

  // Business C: Box Cricket Arena (Pending admin approval demo)
  const cricketOwner = await prisma.user.create({
    data: {
      name: 'Vikram Rajput',
      email: 'owner@boxcricket.com',
      phone: '+919722334455',
      passwordHash: ownerPasswordHash,
      role: UserRole.BUSINESS_OWNER,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.business.create({
    data: {
      name: 'PowerBox Cricket Arena',
      slug: 'powerbox-cricket-arena',
      logo: 'https://images.unsplash.com/photo-1531415074868-036b1c57e3b0?auto=format&fit=crop&w=300&q=80',
      coverImage: '/images/box-cricket.jpg',
      description: 'Air-conditioned box cricket turf with live ball tracking, bowling machines, and replay cameras.',
      industryId: industryMap.get('box-cricket') || industryMap.get('sports')!,
      ownerId: cricketOwner.id,
      phone: '+919722334455',
      email: 'play@boxcricket.com',
      address: 'Ring Road Arena',
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India',
      status: BusinessStatus.PENDING, // PENDING so Admin can approve/reject!
    },
  });

  // 5. Create Sample Customers
  const customer1 = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'alex@example.com',
      phone: '+919876500001',
      passwordHash: customerPasswordHash,
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '+919876500002',
      passwordHash: customerPasswordHash,
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
    },
  });

  // Link Customer 1 to SmashZone (Progress: 8/10 visits)
  await prisma.customerBusiness.create({
    data: {
      userId: customer1.id,
      businessId: smashBusiness.id,
      totalVisits: 8,
      totalStamps: 8,
      totalPoints: 160,
      lastVisitAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  });

  // Link Customer 1 to Artisan Cafe (Progress: 3/5 stamps)
  await prisma.customerBusiness.create({
    data: {
      userId: customer1.id,
      businessId: cafeBusiness.id,
      totalVisits: 3,
      totalStamps: 3,
      totalPoints: 60,
      lastVisitAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
  });

  // Seed sample visits & stamps for Customer 1
  for (let i = 1; i <= 8; i++) {
    const visitDate = new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000);
    const visit = await prisma.visit.create({
      data: {
        userId: customer1.id,
        businessId: smashBusiness.id,
        branchId: branch1.id,
        campaignId: smashCampaign.id,
        createdAt: visitDate,
      },
    });

    await prisma.stampTransaction.create({
      data: {
        userId: customer1.id,
        businessId: smashBusiness.id,
        campaignId: smashCampaign.id,
        visitId: visit.id,
        createdAt: visitDate,
      },
    });
  }

  // Link Customer 2 to Artisan Cafe with an UNLOCKED REWARD (Ready to redeem!)
  const cafeReward = await prisma.reward.findFirst({
    where: { businessId: cafeBusiness.id },
  });

  if (cafeReward) {
    await prisma.customerBusiness.create({
      data: {
        userId: customer2.id,
        businessId: cafeBusiness.id,
        totalVisits: 5,
        totalStamps: 5,
        totalPoints: 100,
        lastVisitAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
    });

    // Create an unlocked redemption code: "BREW-7F92K"
    await prisma.rewardRedemption.create({
      data: {
        rewardId: cafeReward.id,
        userId: customer2.id,
        businessId: cafeBusiness.id,
        code: 'BREW-7F92K',
        status: RewardStatus.CLAIMED,
        claimedAt: new Date(),
      },
    });
  }

  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

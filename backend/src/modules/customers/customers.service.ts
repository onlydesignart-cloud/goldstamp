import prisma from '../../lib/prisma';
import { logAudit } from '../../utils/audit';
import { notificationService } from '../../lib/notifications';

export class CustomersService {
  /**
   * Customer views all their joined business loyalty programs
   */
  async getCustomerLoyaltyPrograms(userId: string) {
    const memberships = await prisma.customerBusiness.findMany({
      where: { userId },
      include: {
        business: {
          include: {
            industry: true,
            campaigns: {
              where: { status: 'ACTIVE' },
              include: { rules: true, rewards: true },
            },
          },
        },
      },
      orderBy: { lastVisitAt: 'desc' },
    });

    return memberships.map((m) => {
      const activeCampaign = m.business.campaigns[0];
      const targetVisits = activeCampaign?.rules[0]?.conditionValue || 10;
      const currentStamps = m.totalStamps % targetVisits === 0 && m.totalStamps > 0
        ? targetVisits
        : m.totalStamps % targetVisits;
      const remainingVisits = Math.max(0, targetVisits - currentStamps);

      return {
        id: m.id,
        businessId: m.businessId,
        businessName: m.business.name,
        businessSlug: m.business.slug,
        businessLogo: m.business.logo,
        businessCoverImage: m.business.coverImage,
        industry: m.business.industry.name,
        totalVisits: m.totalVisits,
        totalStamps: m.totalStamps,
        totalPoints: m.totalPoints,
        lastVisitAt: m.lastVisitAt,
        joinedAt: m.joinedAt,
        activeCampaign: activeCampaign
          ? {
              id: activeCampaign.id,
              name: activeCampaign.name,
              type: activeCampaign.type,
              target: targetVisits,
              rewardTitle: activeCampaign.rewards[0]?.title || 'Reward',
            }
          : null,
        currentStamps,
        targetVisits,
        remainingVisits,
      };
    });
  }

  /**
   * Customer joins a business loyalty program
   */
  async joinProgram(userId: string, businessId: string) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { campaigns: { where: { status: 'ACTIVE' } } },
    });

    if (!business) {
      throw new Error('NOT_FOUND: Business not found');
    }

    const membership = await prisma.customerBusiness.upsert({
      where: {
        userId_businessId: { userId, businessId },
      },
      create: {
        userId,
        businessId,
      },
      update: {},
      include: { business: true },
    });

    await logAudit({
      actorId: userId,
      actorRole: 'CUSTOMER',
      action: 'JOINED_LOYALTY_PROGRAM',
      entityType: 'BUSINESS',
      entityId: businessId,
    });

    await notificationService.notify({
      userId,
      title: 'Joined Loyalty Program!',
      message: `You are now a member of ${business.name}'s loyalty program! Collect stamps on every visit to unlock exclusive rewards.`,
      type: 'LOYALTY_JOINED',
    });

    return membership;
  }

  /**
   * Customer visits history
   */
  async getCustomerVisits(userId: string, limit = 50) {
    return prisma.visit.findMany({
      where: { userId },
      include: {
        business: { select: { id: true, name: true, slug: true, logo: true } },
        campaign: { select: { id: true, name: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Customer points ledger & transactions
   */
  async getCustomerPointsLedger(userId: string) {
    const [transactions, memberships] = await Promise.all([
      prisma.pointTransaction.findMany({
        where: { userId },
        include: {
          business: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customerBusiness.findMany({
        where: { userId },
        select: { businessId: true, totalPoints: true, business: { select: { name: true } } },
      }),
    ]);

    const totalPointsAcrossAll = memberships.reduce((acc, curr) => acc + curr.totalPoints, 0);

    return {
      totalPoints: totalPointsAcrossAll,
      pointsByBusiness: memberships,
      transactions,
    };
  }

  /**
   * Business owner views their customer directory with search and filter
   */
  async getBusinessCustomers(params: {
    businessId: string;
    search?: string;
    filter?: 'all' | 'recent' | 'unlocked';
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      businessId: params.businessId,
    };

    if (params.search) {
      where.user = {
        OR: [
          { name: { contains: params.search, mode: 'insensitive' } },
          { email: { contains: params.search, mode: 'insensitive' } },
          { phone: { contains: params.search, mode: 'insensitive' } },
        ],
      };
    }

    if (params.filter === 'recent') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      where.lastVisitAt = { gte: sevenDaysAgo };
    }

    const [rawItems, total] = await Promise.all([
      prisma.customerBusiness.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, avatar: true },
          },
          business: {
            include: {
              campaigns: {
                where: { status: 'ACTIVE' },
                take: 1,
                include: { rewards: true },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { lastVisitAt: 'desc' },
      }),
      prisma.customerBusiness.count({ where }),
    ]);

    const items = rawItems.map((item) => {
      const activeCampaign = item.business.campaigns[0];
      return {
        ...item,
        campaign: activeCampaign
          ? {
              id: activeCampaign.id,
              name: activeCampaign.name,
              type: activeCampaign.type,
              rewardTitle: activeCampaign.rewards?.[0]?.title || 'Loyalty Reward',
            }
          : null,
      };
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export const customersService = new CustomersService();

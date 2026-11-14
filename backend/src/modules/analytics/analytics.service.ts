import prisma from '../../lib/prisma';
import { RewardStatus } from '@prisma/client';

export class AnalyticsService {
  async getBusinessDashboardMetrics(businessId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [
      totalCustomers,
      todayVisits,
      monthlyVisits,
      totalStamps,
      pointsIssuedAggregate,
      rewardsUnlocked,
      rewardsRedeemed,
      activeCampaigns,
    ] = await Promise.all([
      prisma.customerBusiness.count({ where: { businessId } }),
      prisma.visit.count({
        where: { businessId, createdAt: { gte: todayStart } },
      }),
      prisma.visit.count({
        where: { businessId, createdAt: { gte: monthStart } },
      }),
      prisma.stampTransaction.count({ where: { businessId } }),
      prisma.pointTransaction.aggregate({
        where: { businessId, type: 'EARN' },
        _sum: { amount: true },
      }),
      prisma.rewardRedemption.count({ where: { businessId } }),
      prisma.rewardRedemption.count({
        where: { businessId, status: RewardStatus.REDEEMED },
      }),
      prisma.campaign.count({
        where: { businessId, status: 'ACTIVE' },
      }),
    ]);

    // Generate last 7 days time-series visits data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const visitsCount = await prisma.visit.count({
        where: {
          businessId,
          createdAt: { gte: dayStart, lte: dayEnd },
        },
      });

      const dayLabel = dayStart.toLocaleDateString('en-US', { weekday: 'short' });
      last7Days.push({
        date: dayLabel,
        visits: visitsCount,
      });
    }

    // Top loyal customers
    const topCustomers = await prisma.customerBusiness.findMany({
      where: { businessId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { totalVisits: 'desc' },
      take: 5,
    });

    // Recent activity feed
    const recentVisits = await prisma.visit.findMany({
      where: { businessId },
      include: {
        user: { select: { name: true } },
        campaign: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    const recentRedemptions = await prisma.rewardRedemption.findMany({
      where: { businessId },
      include: {
        user: { select: { name: true } },
        reward: { select: { title: true } },
      },
      orderBy: { claimedAt: 'desc' },
      take: 4,
    });

    return {
      summary: {
        totalCustomers,
        todayVisits,
        monthlyVisits,
        totalStamps,
        pointsIssued: pointsIssuedAggregate._sum.amount || 0,
        rewardsUnlocked,
        rewardsRedeemed,
        activeCampaigns,
      },
      visitsOverTime: last7Days,
      topCustomers,
      recentActivity: [
        ...recentVisits.map((v) => ({
          type: 'VISIT',
          title: `Visit verified for ${v.user.name}`,
          subtitle: v.campaign?.name || 'Standard check-in',
          time: v.createdAt,
        })),
        ...recentRedemptions.map((r) => ({
          type: 'REDEMPTION',
          title: `Reward claimed: ${r.reward.title}`,
          subtitle: `Customer: ${r.user.name} (${r.code})`,
          time: r.claimedAt,
        })),
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8),
    };
  }

  async getPlatformAdminMetrics() {
    const [
      totalBusinesses,
      activeBusinesses,
      pendingBusinesses,
      totalCustomers,
      totalVisits,
      totalStamps,
      totalRewards,
      totalRedemptions,
      subscriptions,
      plans,
    ] = await Promise.all([
      prisma.business.count(),
      prisma.business.count({ where: { status: 'ACTIVE' } }),
      prisma.business.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.visit.count(),
      prisma.stampTransaction.count(),
      prisma.reward.count(),
      prisma.rewardRedemption.count({ where: { status: 'REDEEMED' } }),
      prisma.subscription.findMany({
        where: { status: 'ACTIVE' },
        include: { plan: true },
      }),
      prisma.subscriptionPlan.findMany(),
    ]);

    const mrr = subscriptions.reduce((sum, s) => sum + (s.plan?.price || 0), 0);
    const arr = mrr * 12;

    // Last 6 months growth simulation / aggregation
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const businessGrowth = months.map((m, idx) => ({
      month: m,
      businesses: Math.max(1, Math.round(totalBusinesses * ((idx + 1) / months.length))),
      customers: Math.max(2, Math.round(totalCustomers * ((idx + 1) / months.length))),
      visits: Math.max(5, Math.round(totalVisits * ((idx + 1) / months.length))),
      revenue: Math.round(mrr * ((idx + 1) / months.length)),
    }));

    return {
      summary: {
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
        activeSubscriptions: subscriptions.length,
      },
      growthData: businessGrowth,
      plans,
    };
  }
}

export const analyticsService = new AnalyticsService();

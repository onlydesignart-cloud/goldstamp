import prisma from '../../lib/prisma';
import crypto from 'crypto';
import { logAudit } from '../../utils/audit';
import { notificationService } from '../../lib/notifications';
import { RewardStatus } from '@prisma/client';

export class RewardsService {
  async getBusinessRewards(businessId: string) {
    return prisma.reward.findMany({
      where: { businessId },
      include: {
        campaign: { select: { id: true, name: true, type: true } },
        _count: { select: { redemptions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCustomerAvailableRewards(userId: string) {
    // Redemptions that are CLAIMED or AVAILABLE for this customer
    return prisma.rewardRedemption.findMany({
      where: {
        userId,
        status: { in: [RewardStatus.CLAIMED, RewardStatus.AVAILABLE] },
      },
      include: {
        reward: true,
        business: {
          select: { id: true, name: true, slug: true, logo: true, address: true, city: true },
        },
      },
      orderBy: { claimedAt: 'desc' },
    });
  }

  async getCustomerAllRewards(userId: string) {
    return prisma.rewardRedemption.findMany({
      where: { userId },
      include: {
        reward: true,
        business: {
          select: { id: true, name: true, slug: true, logo: true },
        },
      },
      orderBy: { claimedAt: 'desc' },
    });
  }

  /**
   * Customer initiates redemption of an unlocked reward
   */
  async claimReward(userId: string, rewardId: string) {
    // Verify reward exists
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
      include: { business: true },
    });

    if (!reward) {
      throw new Error('NOT_FOUND: Reward not found');
    }

    if (reward.validUntil && reward.validUntil < new Date()) {
      throw new Error('REWARD_EXPIRED: This reward has expired');
    }

    // Check if customer already has a claimed active redemption for this reward
    const existing = await prisma.rewardRedemption.findFirst({
      where: {
        userId,
        rewardId,
        status: RewardStatus.CLAIMED,
      },
    });

    if (existing) {
      return existing;
    }

    // Generate unique code: e.g. SMASH-7F92K
    const prefix = reward.business.name.replace(/[^A-Za-z]/g, '').substring(0, 5).toUpperCase();
    const uniquePart = crypto.randomBytes(3).toString('hex').toUpperCase();
    const code = `${prefix}-${uniquePart}`;

    const redemption = await prisma.rewardRedemption.create({
      data: {
        rewardId: reward.id,
        userId,
        businessId: reward.businessId,
        code,
        status: RewardStatus.CLAIMED,
      },
      include: {
        reward: true,
        business: true,
      },
    });

    await logAudit({
      actorId: userId,
      actorRole: 'CUSTOMER',
      action: 'REWARD_CLAIMED',
      entityType: 'REWARD_REDEMPTION',
      entityId: redemption.id,
      metadata: { code, rewardTitle: reward.title },
    });

    await notificationService.notify({
      userId,
      title: '🎁 Reward Ready to Redeem',
      message: `Your voucher code for ${reward.title} is: ${code}. Show this to staff!`,
      type: 'REWARD_CLAIMED',
    });

    return redemption;
  }
}

export const rewardsService = new RewardsService();

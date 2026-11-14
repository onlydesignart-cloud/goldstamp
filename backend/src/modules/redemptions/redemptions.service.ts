import prisma from '../../lib/prisma';
import { logAudit } from '../../utils/audit';
import { notificationService } from '../../lib/notifications';
import { RewardStatus } from '@prisma/client';

export class RedemptionsService {
  async getBusinessRedemptions(businessId: string, limit = 50) {
    return prisma.rewardRedemption.findMany({
      where: { businessId },
      include: {
        reward: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { claimedAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Business owner or staff verifies and marks a reward as REDEEMED
   */
  async verifyAndRedeem(code: string, businessId: string, verifiedByUserId: string) {
    const formattedCode = code.trim().toUpperCase();

    // Find the redemption record
    const redemption = await prisma.rewardRedemption.findUnique({
      where: { code: formattedCode },
      include: {
        reward: true,
        user: { select: { id: true, name: true, email: true } },
        business: { select: { id: true, name: true } },
      },
    });

    if (!redemption) {
      throw new Error('CODE_NOT_FOUND: Redemption code not found or invalid');
    }

    // Verify it belongs to the verifying business
    if (redemption.businessId !== businessId) {
      throw new Error('CROSS_BUSINESS_FORBIDDEN: This redemption code belongs to a different business');
    }

    // Verify status
    if (redemption.status === RewardStatus.REDEEMED) {
      throw new Error('ALREADY_REDEEMED: This reward has already been used and redeemed');
    }

    if (redemption.status === RewardStatus.EXPIRED) {
      throw new Error('REWARD_EXPIRED: This redemption code has expired');
    }

    if (redemption.status === RewardStatus.CANCELLED) {
      throw new Error('REWARD_CANCELLED: This redemption code was cancelled');
    }

    // Atomic transaction to mark REDEEMED
    const updated = await prisma.$transaction(async (tx) => {
      return tx.rewardRedemption.update({
        where: { id: redemption.id },
        data: {
          status: RewardStatus.REDEEMED,
          redeemedAt: new Date(),
          verifiedBy: verifiedByUserId,
        },
        include: {
          reward: true,
          user: { select: { id: true, name: true, email: true } },
        },
      });
    });

    await logAudit({
      actorId: verifiedByUserId,
      actorRole: 'BUSINESS_STAFF',
      action: 'REWARD_REDEEMED',
      entityType: 'REWARD_REDEMPTION',
      entityId: updated.id,
      metadata: {
        code: formattedCode,
        rewardTitle: updated.reward.title,
        customerId: updated.userId,
      },
    });

    await notificationService.notify({
      userId: updated.userId,
      title: '🎉 Reward Redeemed!',
      message: `Your reward "${updated.reward.title}" has been successfully redeemed at ${redemption.business.name}. Enjoy!`,
      type: 'REWARD_REDEEMED',
    });

    return updated;
  }
}

export const redemptionsService = new RedemptionsService();

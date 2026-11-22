import crypto from 'crypto';
import prisma from '../../lib/prisma';
import { verifyQrToken, verifyCustomerPassToken } from '../../utils/jwt';
import { logAudit } from '../../utils/audit';
import { notificationService } from '../../lib/notifications';
import { VerificationMethod, RewardStatus, PointTransactionType } from '@prisma/client';

export interface CheckInOptions {
  token: string;
  userId: string;
  deviceInfo?: string;
  ipAddress?: string;
}

export interface StaffCheckInOptions {
  customerPassToken?: string;
  customerUserId?: string;
  businessId: string;
  campaignId?: string;
  branchId?: string;
  staffUserId: string;
  deviceInfo?: string;
  ipAddress?: string;
}

export class CheckInService {
  /**
   * Customer-scanned Dynamic QR check-in
   */
  async processCheckIn(options: CheckInOptions) {
    // 1. Verify cryptographic QR token
    let decoded;
    try {
      decoded = verifyQrToken(options.token);
    } catch (err: any) {
      throw new Error('INVALID_TOKEN: QR code has expired or is invalid. Please scan a fresh QR.');
    }

    const { businessId, branchId, campaignId } = decoded;

    // 2. Anti-Replay Database Guard: Token must exist, not be expired, and never used
    const qrRecord = await prisma.qRCode.findUnique({
      where: { token: options.token },
    });

    if (!qrRecord) {
      throw new Error('INVALID_TOKEN: QR code is unrecognized or not issued by this platform.');
    }

    if (qrRecord.isUsed) {
      throw new Error('FRAUD_PREVENTED: This QR code has already been scanned. Dynamic QR tokens are strictly single-use and cannot be reused by anyone.');
    }

    const now = Date.now();
    const expiryTime = new Date(qrRecord.expiresAt).getTime();
    const createdAtTime = new Date(qrRecord.createdAt).getTime();
    const isRecentlyCreated = createdAtTime > 0 && (now - createdAtTime < 30 * 60 * 1000);
    const isBeforeExpiry = expiryTime > 0 && (now <= expiryTime + 300000);

    if (!isRecentlyCreated && !isBeforeExpiry) {
      throw new Error('EXPIRED_TOKEN: This QR code has expired. Please scan the current code on the counter screen.');
    }

    return this.executeAtomicCheckIn({
      userId: options.userId,
      businessId,
      branchId,
      campaignId,
      verificationMethod: VerificationMethod.QR,
      verifiedBy: null,
      deviceInfo: options.deviceInfo,
      ipAddress: options.ipAddress,
      qrToken: options.token,
    });
  }

  /**
   * Staff scanning customer loyalty pass QR or manual check-in
   */
  async processStaffCheckIn(options: StaffCheckInOptions) {
    let customerUserId = options.customerUserId;

    if (options.customerPassToken) {
      const decoded = verifyCustomerPassToken(options.customerPassToken);
      customerUserId = decoded.userId;
    }

    if (!customerUserId) {
      throw new Error('BAD_REQUEST: Customer ID or pass token is required');
    }

    return this.executeAtomicCheckIn({
      userId: customerUserId,
      businessId: options.businessId,
      branchId: options.branchId,
      campaignId: options.campaignId,
      verificationMethod: VerificationMethod.STAFF,
      verifiedBy: options.staffUserId,
      deviceInfo: options.deviceInfo,
      ipAddress: options.ipAddress,
    });
  }

  /**
   * Central atomic PostgreSQL transaction for check-ins, stamps, points, & reward evaluation
   */
  private async executeAtomicCheckIn(params: {
    userId: string;
    businessId: string;
    branchId?: string | null;
    campaignId?: string | null;
    verificationMethod: VerificationMethod;
    verifiedBy?: string | null;
    deviceInfo?: string | null;
    ipAddress?: string | null;
    qrToken?: string | null;
  }) {
    // 1. Fetch business and check status
    const business = await prisma.business.findUnique({
      where: { id: params.businessId },
      include: {
        campaigns: {
          where: { status: 'ACTIVE' },
          include: { rules: true, rewards: true },
        },
      },
    });

    if (!business || business.status !== 'ACTIVE') {
      throw new Error('BUSINESS_INACTIVE: This business is currently not active.');
    }

    // 2. Select target campaign (either specified or the primary active campaign)
    let campaign = params.campaignId
      ? business.campaigns.find((c) => c.id === params.campaignId)
      : business.campaigns[0];

    if (!campaign) {
      // If no campaign specified and none active, pick any or throw
      if (business.campaigns.length > 0) {
        campaign = business.campaigns[0];
      } else {
        throw new Error('NO_ACTIVE_CAMPAIGN: No active loyalty campaign is currently running for this business.');
      }
    }

    // 3. Cooldown check (Anti-Fraud duplicate prevention)
    const cooldownMins = business.cooldownMinutes !== undefined && business.cooldownMinutes !== null
      ? business.cooldownMinutes
      : 60;

    if (cooldownMins > 0) {
      const cooldownThreshold = new Date(Date.now() - cooldownMins * 60 * 1000);

      const recentVisit = await prisma.visit.findFirst({
        where: {
          userId: params.userId,
          businessId: params.businessId,
          createdAt: { gte: cooldownThreshold },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (recentVisit) {
        const remainingMinutes = Math.ceil(
          (cooldownMins * 60 * 1000 - (Date.now() - recentVisit.createdAt.getTime())) / (60 * 1000)
        );
        throw new Error(
          `COOLDOWN_ACTIVE: You have already checked in recently. Please wait ${remainingMinutes} minute(s) before checking in again.`
        );
      }
    }

    // Determine target milestone from campaign rules
    const primaryRule = campaign.rules[0] || {
      conditionType: 'VISIT_COUNT',
      conditionValue: 10,
      rewardType: 'FREE_SERVICE',
      rewardValue: 'Reward',
    };
    const milestoneTarget = primaryRule.conditionValue;

    // 4. ATOMIC DATABASE TRANSACTION
    const result = await prisma.$transaction(async (tx) => {
      // 0. Single-Use Token Burn (Anti-Replay Guard)
      if (params.qrToken) {
        await tx.qRCode.update({
          where: { token: params.qrToken },
          data: { isUsed: true },
        });
      }

      // A. Create Visit record
      const visit = await tx.visit.create({
        data: {
          userId: params.userId,
          businessId: params.businessId,
          branchId: params.branchId || null,
          campaignId: campaign!.id,
          verificationMethod: params.verificationMethod,
          verifiedBy: params.verifiedBy || null,
          deviceInfo: params.deviceInfo || null,
          ipAddress: params.ipAddress || null,
        },
      });

      // B. Create Stamp record
      const stamp = await tx.stampTransaction.create({
        data: {
          userId: params.userId,
          businessId: params.businessId,
          campaignId: campaign!.id,
          visitId: visit.id,
          issuedBy: params.verifiedBy || null,
          verificationMethod: params.verificationMethod,
        },
      });

      // C. Calculate Points (e.g. 20 points per verified visit)
      const pointsEarned = 20;
      await tx.pointTransaction.create({
        data: {
          userId: params.userId,
          businessId: params.businessId,
          campaignId: campaign!.id,
          amount: pointsEarned,
          type: PointTransactionType.EARN,
          referenceId: visit.id,
          description: `Points for verified visit at ${business.name}`,
        },
      });

      // D. Upsert CustomerBusiness record
      const customerBiz = await tx.customerBusiness.upsert({
        where: {
          userId_businessId: {
            userId: params.userId,
            businessId: params.businessId,
          },
        },
        create: {
          userId: params.userId,
          businessId: params.businessId,
          totalVisits: 1,
          totalStamps: 1,
          totalPoints: pointsEarned,
          lastVisitAt: new Date(),
        },
        update: {
          totalVisits: { increment: 1 },
          totalStamps: { increment: 1 },
          totalPoints: { increment: pointsEarned },
          lastVisitAt: new Date(),
        },
      });

      // E. Evaluate Campaign Rules & Milestone
      // Calculate current stamps within the current cycle
      const cycleStamps = customerBiz.totalStamps % milestoneTarget === 0
        ? milestoneTarget
        : customerBiz.totalStamps % milestoneTarget;

      let rewardUnlocked = null;

      // Milestone reached!
      if (customerBiz.totalStamps > 0 && customerBiz.totalStamps % milestoneTarget === 0) {
        // Find associated reward definition or default reward
        const targetReward = campaign!.rewards[0] || (await tx.reward.findFirst({
          where: { businessId: params.businessId },
        }));

        if (targetReward) {
          // Generate unique human-readable redemption code: e.g. SMASH-8X2KP
          const prefix = business.name.replace(/[^A-Za-z]/g, '').substring(0, 5).toUpperCase();
          const uniquePart = crypto.randomBytes(3).toString('hex').toUpperCase();
          const code = `${prefix}-${uniquePart}`;

          rewardUnlocked = await tx.rewardRedemption.create({
            data: {
              rewardId: targetReward.id,
              userId: params.userId,
              businessId: params.businessId,
              code,
              status: RewardStatus.CLAIMED,
              claimedAt: new Date(),
            },
            include: { reward: true },
          });
        }
      }

      return {
        visit,
        stamp,
        pointsEarned,
        totalStamps: customerBiz.totalStamps,
        cycleStamps,
        milestoneTarget,
        rewardUnlocked,
      };
    });

    // 5. Audit Logging
    await logAudit({
      actorId: params.verifiedBy || params.userId,
      actorRole: params.verifiedBy ? 'BUSINESS_STAFF' : 'CUSTOMER',
      action: 'CHECKIN_VERIFIED',
      entityType: 'VISIT',
      entityId: result.visit.id,
      metadata: {
        businessId: params.businessId,
        cycleStamps: result.cycleStamps,
        target: result.milestoneTarget,
        rewardUnlocked: !!result.rewardUnlocked,
      },
      ipAddress: params.ipAddress,
    });

    // 6. User Notification
    if (result.rewardUnlocked) {
      await notificationService.notify({
        userId: params.userId,
        title: '🎉 Milestone Unlocked!',
        message: `Congratulations! You completed ${milestoneTarget}/${milestoneTarget} visits at ${business.name}. Your reward is ready to redeem!`,
        type: 'REWARD_UNLOCKED',
        metadata: { redemptionCode: result.rewardUnlocked.code },
      });
    } else {
      const remaining = result.milestoneTarget - result.cycleStamps;
      await notificationService.notify({
        userId: params.userId,
        title: '🎉 Visit Verified!',
        message: `Stamp added at ${business.name}! Progress: ${result.cycleStamps}/${result.milestoneTarget}. Only ${remaining} more visit(s) to unlock your reward!`,
        type: 'STAMP_ISSUED',
      });
    }

    const message = result.rewardUnlocked
      ? `🎉 Congratulations! You reached ${milestoneTarget}/${milestoneTarget} visits! Your reward has been unlocked!`
      : `🎉 Visit verified! Stamp added. ${result.cycleStamps} / ${result.milestoneTarget} visits completed. Only ${
          result.milestoneTarget - result.cycleStamps
        } more visit(s) to unlock your reward!`;

    return {
      verified: true,
      visit: result.visit,
      stamp: result.stamp,
      pointsEarned: result.pointsEarned,
      currentStamps: result.cycleStamps,
      totalStamps: result.totalStamps,
      milestoneTarget: result.milestoneTarget,
      rewardUnlocked: result.rewardUnlocked,
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        logo: business.logo,
      },
      message,
    };
  }
}

export const checkInService = new CheckInService();

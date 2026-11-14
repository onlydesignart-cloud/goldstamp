import prisma from '../../lib/prisma';
import { campaignsRepository } from './campaigns.repository';
import { logAudit } from '../../utils/audit';
import { CampaignStatus, CampaignType, RewardType, RewardStatus } from '@prisma/client';

export class CampaignsService {
  async getByBusinessId(businessId: string) {
    return campaignsRepository.findByBusinessId(businessId);
  }

  async getById(id: string) {
    const campaign = await campaignsRepository.findById(id);
    if (!campaign) {
      throw new Error('NOT_FOUND: Campaign not found');
    }
    return campaign;
  }

  async create(data: {
    businessId: string;
    name: string;
    description?: string;
    type: 'STAMP' | 'VISIT' | 'POINT' | 'SPEND' | 'REFERRAL';
    conditionType: string;
    conditionValue: number;
    rewardTitle: string;
    rewardType: RewardType;
    rewardValue: string;
    startDate?: string;
    endDate?: string | null;
    isRecurring?: boolean;
    recurrenceType?: string | null;
    maxCompletions?: number | null;
  }, actorId: string) {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create campaign
      const campaign = await tx.campaign.create({
        data: {
          businessId: data.businessId,
          name: data.name,
          description: data.description,
          type: data.type as CampaignType,
          status: CampaignStatus.ACTIVE,
          startDate: data.startDate ? new Date(data.startDate) : new Date(),
          endDate: data.endDate ? new Date(data.endDate) : null,
          isRecurring: data.isRecurring ?? true,
          recurrenceType: data.recurrenceType,
          maxCompletions: data.maxCompletions,
          rules: {
            create: [
              {
                conditionType: data.conditionType,
                conditionValue: data.conditionValue,
                rewardType: data.rewardType,
                rewardValue: data.rewardValue,
              },
            ],
          },
          rewards: {
            create: [
              {
                businessId: data.businessId,
                title: data.rewardTitle,
                description: `${data.rewardValue} - unlocked after ${data.conditionValue} ${data.type.toLowerCase()}s`,
                type: data.rewardType,
                value: data.rewardValue,
                status: RewardStatus.AVAILABLE,
              },
            ],
          },
        },
        include: { rules: true, rewards: true },
      });

      return campaign;
    });

    await logAudit({
      actorId,
      actorRole: 'BUSINESS_OWNER',
      action: 'CAMPAIGN_CREATED',
      entityType: 'CAMPAIGN',
      entityId: result.id,
      metadata: { name: result.name, type: result.type, target: data.conditionValue },
    });

    return result;
  }

  async updateStatus(id: string, status: CampaignStatus, actorId: string) {
    const updated = await campaignsRepository.update(id, { status });
    await logAudit({
      actorId,
      actorRole: 'BUSINESS_OWNER',
      action: `CAMPAIGN_STATUS_${status}`,
      entityType: 'CAMPAIGN',
      entityId: id,
    });
    return updated;
  }
}

export const campaignsService = new CampaignsService();

import prisma from '../../lib/prisma';
import { CampaignStatus, CampaignType, Prisma } from '@prisma/client';

export class CampaignsRepository {
  async findByBusinessId(businessId: string) {
    return prisma.campaign.findMany({
      where: { businessId },
      include: {
        rules: true,
        rewards: true,
        _count: {
          select: {
            visits: true,
            stampTransactions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.campaign.findUnique({
      where: { id },
      include: {
        rules: true,
        rewards: true,
        business: {
          select: { id: true, name: true, slug: true, logo: true, cooldownMinutes: true },
        },
        _count: {
          select: {
            visits: true,
            stampTransactions: true,
          },
        },
      },
    });
  }

  async create(data: Prisma.CampaignCreateInput) {
    return prisma.campaign.create({
      data,
      include: { rules: true, rewards: true },
    });
  }

  async update(id: string, data: Prisma.CampaignUpdateInput) {
    return prisma.campaign.update({
      where: { id },
      data,
      include: { rules: true, rewards: true },
    });
  }
}

export const campaignsRepository = new CampaignsRepository();

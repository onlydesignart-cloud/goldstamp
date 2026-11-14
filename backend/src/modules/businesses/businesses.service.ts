import prisma from '../../lib/prisma';
import { businessesRepository } from './businesses.repository';
import { logAudit } from '../../utils/audit';
import { BusinessStatus, SubscriptionStatus } from '@prisma/client';

export class BusinessesService {
  async getPublicList(params: {
    industrySlug?: string;
    search?: string;
    city?: string;
    page?: number;
    limit?: number;
  }) {
    return businessesRepository.findManyPublic(params);
  }

  async getBySlug(slug: string) {
    const business = await businessesRepository.findBySlug(slug);
    if (!business) {
      throw new Error('NOT_FOUND: Business not found');
    }
    return business;
  }

  async getByOwnerId(ownerId: string) {
    const business = await businessesRepository.findByOwnerId(ownerId);
    if (!business) {
      throw new Error('NOT_FOUND: No business profile found for this owner');
    }

    // Include quick stats
    const [totalCustomers, todayVisits, totalStamps, activeRewards] = await Promise.all([
      prisma.customerBusiness.count({ where: { businessId: business.id } }),
      prisma.visit.count({
        where: {
          businessId: business.id,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.stampTransaction.count({ where: { businessId: business.id } }),
      prisma.reward.count({ where: { businessId: business.id, status: 'AVAILABLE' } }),
    ]);

    return {
      ...business,
      stats: {
        totalCustomers,
        todayVisits,
        totalStamps,
        activeRewards,
      },
    };
  }

  async create(data: any, ownerId: string) {
    const baseSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = data.slug || baseSlug;

    // Check slug collision
    const existing = await prisma.business.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const created = await prisma.$transaction(async (tx) => {
      const biz = await tx.business.create({
        data: {
          name: data.name,
          slug,
          industryId: data.industryId,
          ownerId,
          description: data.description,
          phone: data.phone,
          email: data.email,
          website: data.website,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country || 'India',
          pincode: data.pincode,
          cooldownMinutes: data.cooldownMinutes || 60,
          status: BusinessStatus.ACTIVE,
        },
        include: { industry: true },
      });

      // Default Starter plan subscription
      const starterPlan = await tx.subscriptionPlan.findFirst({ where: { code: 'STARTER' } });
      if (starterPlan) {
        await tx.subscription.create({
          data: {
            businessId: biz.id,
            planId: starterPlan.id,
            status: SubscriptionStatus.ACTIVE,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }

      return biz;
    });

    await logAudit({
      actorId: ownerId,
      actorRole: 'BUSINESS_OWNER',
      action: 'BUSINESS_CREATED',
      entityType: 'BUSINESS',
      entityId: created.id,
      metadata: { name: created.name, slug: created.slug },
    });

    return created;
  }

  async update(id: string, data: any, actorId: string, actorRole: string) {
    const updated = await businessesRepository.update(id, data);
    await logAudit({
      actorId,
      actorRole,
      action: 'BUSINESS_UPDATED',
      entityType: 'BUSINESS',
      entityId: id,
      metadata: data,
    });
    return updated;
  }

  async updateStatus(id: string, status: BusinessStatus, actorId: string) {
    const updated = await businessesRepository.update(id, { status });
    await logAudit({
      actorId,
      actorRole: 'SUPER_ADMIN',
      action: `BUSINESS_STATUS_${status}`,
      entityType: 'BUSINESS',
      entityId: id,
      metadata: { status },
    });
    return updated;
  }

  async getBranches(businessId: string) {
    return prisma.businessBranch.findMany({
      where: { businessId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createBranch(businessId: string, data: { name: string; address?: string; city?: string; phone?: string }) {
    return prisma.businessBranch.create({
      data: {
        businessId,
        name: data.name,
        address: data.address,
        city: data.city,
        phone: data.phone,
      },
    });
  }
}

export const businessesService = new BusinessesService();

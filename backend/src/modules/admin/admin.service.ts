import prisma from '../../lib/prisma';
import { logAudit } from '../../utils/audit';
import { BusinessStatus, UserRole, UserStatus } from '@prisma/client';

export class AdminService {
  async getAllBusinesses(params: {
    status?: BusinessStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { city: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.business.findMany({
        where,
        include: {
          industry: true,
          owner: { select: { id: true, name: true, email: true, phone: true } },
          subscription: { include: { plan: true } },
          _count: {
            select: {
              customerBusinesses: true,
              visits: true,
              campaigns: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.business.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getBusinessDetail(id: string) {
    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        industry: true,
        owner: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
        branches: true,
        campaigns: { include: { rules: true, rewards: true } },
        subscription: { include: { plan: true } },
        _count: {
          select: {
            customerBusinesses: true,
            visits: true,
            stampTransactions: true,
            rewardRedemptions: true,
          },
        },
      },
    });

    if (!business) {
      throw new Error('NOT_FOUND: Business not found');
    }

    return business;
  }

  async setBusinessStatus(id: string, status: BusinessStatus, actorId: string) {
    const updated = await prisma.business.update({
      where: { id },
      data: { status },
      include: { industry: true, owner: true },
    });

    await logAudit({
      actorId,
      actorRole: 'SUPER_ADMIN',
      action: `ADMIN_SET_BUSINESS_STATUS_${status}`,
      entityType: 'BUSINESS',
      entityId: id,
      metadata: { status, businessName: updated.name },
    });

    return updated;
  }

  async getAllUsers(params: {
    role?: UserRole;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.role) where.role = params.role;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { phone: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              customerBusinesses: true,
              visits: true,
              ownedBusinesses: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async setUserStatus(userId: string, status: UserStatus, actorId: string) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    await logAudit({
      actorId,
      actorRole: 'SUPER_ADMIN',
      action: `ADMIN_SET_USER_STATUS_${status}`,
      entityType: 'USER',
      entityId: userId,
      metadata: { status, userName: updated.name },
    });

    return updated;
  }

  async getAuditLogs(limit = 100) {
    return prisma.auditLog.findMany({
      include: {
        actor: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getAllRedemptions(limit = 50) {
    return prisma.rewardRedemption.findMany({
      include: {
        reward: true,
        business: { select: { id: true, name: true, slug: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { claimedAt: 'desc' },
      take: limit,
    });
  }

  async getAllVisits(limit = 50) {
    return prisma.visit.findMany({
      include: {
        business: { select: { id: true, name: true, slug: true } },
        user: { select: { id: true, name: true, email: true } },
        campaign: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

export const adminService = new AdminService();

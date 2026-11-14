import prisma from '../../lib/prisma';
import { BusinessStatus, Prisma } from '@prisma/client';

export class BusinessesRepository {
  async findManyPublic(params: {
    industrySlug?: string;
    search?: string;
    city?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 12;
    const skip = (page - 1) * limit;

    const where: Prisma.BusinessWhereInput = {
      status: BusinessStatus.ACTIVE,
      ...(params.industrySlug && {
        industry: { slug: params.industrySlug },
      }),
      ...(params.city && {
        city: { contains: params.city, mode: 'insensitive' },
      }),
      ...(params.search && {
        OR: [
          { name: { contains: params.search, mode: 'insensitive' } },
          { description: { contains: params.search, mode: 'insensitive' } },
          { city: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.business.findMany({
        where,
        include: {
          industry: true,
          campaigns: {
            where: { status: 'ACTIVE' },
            include: { rewards: true },
          },
          _count: {
            select: {
              customerBusinesses: true,
              visits: true,
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

  async findBySlug(slug: string) {
    return prisma.business.findUnique({
      where: { slug },
      include: {
        industry: true,
        branches: { where: { isActive: true } },
        campaigns: {
          where: { status: 'ACTIVE' },
          include: { rules: true, rewards: true },
        },
        _count: {
          select: {
            customerBusinesses: true,
            visits: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.business.findUnique({
      where: { id },
      include: {
        industry: true,
        branches: true,
        subscription: { include: { plan: true } },
        owner: { select: { id: true, name: true, email: true, phone: true } },
      },
    });
  }

  async findByOwnerId(ownerId: string) {
    return prisma.business.findFirst({
      where: { ownerId },
      include: {
        industry: true,
        branches: true,
        subscription: { include: { plan: true } },
        campaigns: {
          include: { rules: true, rewards: true },
        },
      },
    });
  }

  async create(data: Prisma.BusinessCreateInput) {
    return prisma.business.create({
      data,
      include: { industry: true },
    });
  }

  async update(id: string, data: Prisma.BusinessUpdateInput) {
    return prisma.business.update({
      where: { id },
      data,
      include: { industry: true },
    });
  }
}

export const businessesRepository = new BusinessesRepository();

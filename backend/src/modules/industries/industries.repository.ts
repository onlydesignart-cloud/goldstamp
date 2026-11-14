import prisma from '../../lib/prisma';

export class IndustriesRepository {
  async findAll(includeInactive = false) {
    return prisma.industry.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: {
          select: { businesses: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.industry.findUnique({
      where: { id },
      include: {
        _count: {
          select: { businesses: true },
        },
      },
    });
  }

  async create(data: { name: string; slug: string; icon?: string; isActive?: boolean }) {
    return prisma.industry.create({
      data,
    });
  }

  async update(id: string, data: Partial<{ name: string; slug: string; icon: string; isActive: boolean }>) {
    return prisma.industry.update({
      where: { id },
      data,
    });
  }
}

export const industriesRepository = new IndustriesRepository();

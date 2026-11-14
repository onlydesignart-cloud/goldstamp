import bcrypt from 'bcrypt';
import prisma from '../../lib/prisma';
import { logAudit } from '../../utils/audit';
import { UserRole, UserStatus } from '@prisma/client';

export class StaffService {
  async getBusinessStaff(businessId: string) {
    return prisma.businessStaff.findMany({
      where: { businessId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, status: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createStaff(params: {
    businessId: string;
    name: string;
    email: string;
    password: string;
    branchId?: string;
    actorUserId: string;
  }) {
    const passwordHash = await bcrypt.hash(params.password, 10);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Check if user already exists
      let user = await tx.user.findUnique({
        where: { email: params.email.toLowerCase() },
      });

      if (!user) {
        user = await tx.user.create({
          data: {
            name: params.name,
            email: params.email.toLowerCase(),
            passwordHash,
            role: UserRole.BUSINESS_STAFF,
            status: UserStatus.ACTIVE,
          },
        });
      }

      // 2. Associate with business as staff
      const staff = await tx.businessStaff.upsert({
        where: {
          businessId_userId: {
            businessId: params.businessId,
            userId: user.id,
          },
        },
        create: {
          businessId: params.businessId,
          userId: user.id,
          role: UserRole.BUSINESS_STAFF,
          branchId: params.branchId || null,
          isActive: true,
        },
        update: {
          isActive: true,
          branchId: params.branchId || null,
        },
        include: { user: true },
      });

      return staff;
    });

    await logAudit({
      actorId: params.actorUserId,
      actorRole: 'BUSINESS_OWNER',
      action: 'STAFF_MEMBER_CREATED',
      entityType: 'STAFF',
      entityId: result.id,
      metadata: { email: params.email, businessId: params.businessId },
    });

    return result;
  }

  async toggleStaffStatus(staffId: string, actorUserId: string) {
    const staff = await prisma.businessStaff.findUnique({ where: { id: staffId } });
    if (!staff) throw new Error('NOT_FOUND: Staff member not found');

    const updated = await prisma.businessStaff.update({
      where: { id: staffId },
      data: { isActive: !staff.isActive },
    });

    await logAudit({
      actorId: actorUserId,
      actorRole: 'BUSINESS_OWNER',
      action: updated.isActive ? 'STAFF_ACTIVATED' : 'STAFF_DEACTIVATED',
      entityType: 'STAFF',
      entityId: staffId,
    });

    return updated;
  }
}

export const staffService = new StaffService();

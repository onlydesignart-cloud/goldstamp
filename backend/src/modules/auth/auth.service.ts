import bcrypt from 'bcrypt';
import prisma from '../../lib/prisma';
import { authRepository } from './auth.repository';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { logAudit } from '../../utils/audit';
import { notificationService } from '../../lib/notifications';
import { UserRole, UserStatus, BusinessStatus, SubscriptionStatus } from '@prisma/client';

export class AuthService {
  async register(data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role?: 'CUSTOMER' | 'BUSINESS_OWNER';
    businessName?: string;
    industryId?: string;
  }) {
    const existing = await authRepository.findByEmail(data.email);
    if (existing) {
      throw new Error('EMAIL_EXISTS: An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const role = (data.role as UserRole) || UserRole.CUSTOMER;

    // Use Prisma transaction if creating both user and business
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email.toLowerCase(),
          phone: data.phone || null,
          passwordHash,
          role,
          status: UserStatus.ACTIVE,
        },
      });

      let business = null;
      if (role === UserRole.BUSINESS_OWNER && data.businessName) {
        // Generate slug
        const baseSlug = data.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

        // Find default or provided industry
        let indId = data.industryId;
        if (!indId) {
          const defaultInd = await tx.industry.findFirst();
          indId = defaultInd?.id || '';
        }

        business = await tx.business.create({
          data: {
            name: data.businessName,
            slug,
            ownerId: user.id,
            industryId: indId,
            status: BusinessStatus.ACTIVE, // Or PENDING for admin approval flow
          },
        });

        // Find default starter plan
        const starterPlan = await tx.subscriptionPlan.findFirst({
          where: { code: 'STARTER' },
        });

        if (starterPlan) {
          await tx.subscription.create({
            data: {
              businessId: business.id,
              planId: starterPlan.id,
              status: SubscriptionStatus.ACTIVE,
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });
        }
      }

      return { user, business };
    });

    const accessToken = signAccessToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role as any,
      businessId: result.business?.id,
    });

    const refreshToken = signRefreshToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role as any,
      businessId: result.business?.id,
    });

    await logAudit({
      actorId: result.user.id,
      actorRole: result.user.role,
      action: 'USER_REGISTERED',
      entityType: 'USER',
      entityId: result.user.id,
    });

    await notificationService.notify({
      userId: result.user.id,
      title: 'Welcome to Gold Stamp!',
      message: `Hello ${result.user.name}, your account has been successfully created.`,
      type: 'WELCOME',
    });

    return {
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone,
        role: result.user.role,
        status: result.user.status,
      },
      business: result.business,
      accessToken,
      refreshToken,
    };
  }

  async login(data: { email: string; password: string }) {
    const user = await authRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('INVALID_CREDENTIALS: Invalid email or password');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new Error('ACCOUNT_SUSPENDED: Your account has been suspended by an administrator');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new Error('INVALID_CREDENTIALS: Invalid email or password');
    }

    // If business owner or staff, look up associated business
    let business = null;
    if (user.role === UserRole.BUSINESS_OWNER) {
      business = await prisma.business.findFirst({
        where: { ownerId: user.id },
      });
    } else if (user.role === UserRole.BUSINESS_STAFF) {
      const staffRel = await prisma.businessStaff.findFirst({
        where: { userId: user.id },
        include: { business: true },
      });
      business = staffRel?.business || null;
    }

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      businessId: business?.id,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      businessId: business?.id,
    });

    await logAudit({
      actorId: user.id,
      actorRole: user.role,
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityId: user.id,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
      business,
      accessToken,
      refreshToken,
    };
  }

  async refresh(token: string) {
    const decoded = verifyRefreshToken(token);
    const user = await authRepository.findById(decoded.userId);
    if (!user || user.status === UserStatus.SUSPENDED) {
      throw new Error('INVALID_TOKEN: User session is invalid or suspended');
    }

    let businessId = decoded.businessId;
    if (!businessId && user.role === UserRole.BUSINESS_OWNER) {
      const biz = await prisma.business.findFirst({ where: { ownerId: user.id } });
      businessId = biz?.id;
    }

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      businessId,
    });

    return { accessToken };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        ownedBusinesses: {
          include: {
            industry: true,
            subscription: { include: { plan: true } },
          },
        },
        staffMemberships: {
          include: {
            business: {
              include: { industry: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND: User does not exist');
    }

    return user;
  }
}

export const authService = new AuthService();

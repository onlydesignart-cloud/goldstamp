import prisma from '../lib/prisma';

export interface AuditLogParams {
  actorId?: string | null;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, any> | string;
  ipAddress?: string | null;
}

export const logAudit = async (params: AuditLogParams): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId || null,
        actorRole: params.actorRole || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        metadata: params.metadata
          ? typeof params.metadata === 'string'
            ? params.metadata
            : JSON.stringify(params.metadata)
          : null,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (error) {
    // Non-blocking log error
    console.error('Failed to write audit log:', error);
  }
};

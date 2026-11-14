import { industriesRepository } from './industries.repository';
import { logAudit } from '../../utils/audit';

export class IndustriesService {
  async getAll(includeInactive = false) {
    const list = await industriesRepository.findAll(includeInactive);
    return list.map((ind) => ({
      id: ind.id,
      name: ind.name,
      slug: ind.slug,
      icon: ind.icon,
      isActive: ind.isActive,
      businessCount: ind._count.businesses,
      createdAt: ind.createdAt,
    }));
  }

  async create(data: { name: string; slug: string; icon?: string; isActive?: boolean }, actorId: string) {
    const created = await industriesRepository.create(data);
    await logAudit({
      actorId,
      actorRole: 'SUPER_ADMIN',
      action: 'INDUSTRY_CREATED',
      entityType: 'INDUSTRY',
      entityId: created.id,
      metadata: { name: data.name },
    });
    return created;
  }

  async update(id: string, data: any, actorId: string) {
    const updated = await industriesRepository.update(id, data);
    await logAudit({
      actorId,
      actorRole: 'SUPER_ADMIN',
      action: 'INDUSTRY_UPDATED',
      entityType: 'INDUSTRY',
      entityId: id,
      metadata: data,
    });
    return updated;
  }

  async toggleActive(id: string, actorId: string) {
    const ind = await industriesRepository.findById(id);
    if (!ind) throw new Error('NOT_FOUND: Industry not found');
    const updated = await industriesRepository.update(id, { isActive: !ind.isActive });
    await logAudit({
      actorId,
      actorRole: 'SUPER_ADMIN',
      action: updated.isActive ? 'INDUSTRY_ACTIVATED' : 'INDUSTRY_DEACTIVATED',
      entityType: 'INDUSTRY',
      entityId: id,
    });
    return updated;
  }
}

export const industriesService = new IndustriesService();

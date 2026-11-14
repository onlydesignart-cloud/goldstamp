import prisma from './prisma';

export interface JobDefinition {
  name: string;
  handler: (data?: any) => Promise<void>;
}

export class TaskQueue {
  private jobs: Map<string, JobDefinition> = new Map();
  private intervalTimer: NodeJS.Timeout | null = null;

  register(name: string, handler: (data?: any) => Promise<void>) {
    this.jobs.set(name, { name, handler });
  }

  async dispatch(name: string, data?: any): Promise<void> {
    const job = this.jobs.get(name);
    if (!job) {
      console.warn(`[Queue] No handler registered for job: ${name}`);
      return;
    }

    // Execute asynchronously
    setImmediate(async () => {
      try {
        console.log(`[Queue] Executing job: ${name}`);
        await job.handler(data);
        console.log(`[Queue] Completed job: ${name}`);
      } catch (err) {
        console.error(`[Queue] Error running job ${name}:`, err);
      }
    });
  }

  startPeriodicWorkers() {
    if (this.intervalTimer) return;

    // Run periodic sweeps every 5 minutes
    this.intervalTimer = setInterval(async () => {
      await this.runMaintenanceSweeps();
    }, 5 * 60 * 1000);

    console.log('[Queue] Background job scheduler initialized.');
  }

  private async runMaintenanceSweeps() {
    try {
      const now = new Date();

      // 1. Expire past-due rewards
      const expiredRewards = await prisma.reward.updateMany({
        where: {
          validUntil: { lt: now },
          status: 'AVAILABLE',
        },
        data: {
          status: 'EXPIRED',
        },
      });
      if (expiredRewards.count > 0) {
        console.log(`[Queue] Expired ${expiredRewards.count} rewards.`);
      }

      // 2. Expire past-due campaigns
      const expiredCampaigns = await prisma.campaign.updateMany({
        where: {
          endDate: { lt: now },
          status: 'ACTIVE',
        },
        data: {
          status: 'EXPIRED',
        },
      });
      if (expiredCampaigns.count > 0) {
        console.log(`[Queue] Expired ${expiredCampaigns.count} campaigns.`);
      }
    } catch (err) {
      console.error('[Queue] Maintenance sweep error:', err);
    }
  }

  stop() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }
}

export const taskQueue = new TaskQueue();

// Register background jobs
taskQueue.register('REWARD_EXPIRY', async () => {
  const now = new Date();
  await prisma.reward.updateMany({
    where: { validUntil: { lt: now }, status: 'AVAILABLE' },
    data: { status: 'EXPIRED' },
  });
});

taskQueue.register('CAMPAIGN_EXPIRY', async () => {
  const now = new Date();
  await prisma.campaign.updateMany({
    where: { endDate: { lt: now }, status: 'ACTIVE' },
    data: { status: 'EXPIRED' },
  });
});

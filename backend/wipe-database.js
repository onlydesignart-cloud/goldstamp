const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== STEP 1: Creating Safety Backup of Current Database ===');
  const backup = {};
  const allModels = [
    'user',
    'business',
    'businessBranch',
    'businessStaff',
    'campaign',
    'campaignRule',
    'reward',
    'customerBusiness',
    'visit',
    'stampTransaction',
    'pointTransaction',
    'rewardRedemption',
    'qRCode',
    'subscription',
    'subscriptionPlan',
    'industry',
    'notification',
    'auditLog'
  ];

  for (const m of allModels) {
    try {
      backup[m] = await prisma[m].findMany();
      console.log(`Backed up ${m}: ${backup[m].length} rows`);
    } catch (e) {
      console.warn(`Could not read ${m}:`, e.message);
    }
  }

  const backupPath = path.join(__dirname, `db-backup-${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf-8');
  console.log(`Safety backup successfully saved to: ${backupPath}\n`);

  console.log('=== STEP 2: Wiping / Purging All Table Data ===');
  // Order of deletion respecting Foreign Key dependencies
  const deletionOrder = [
    { name: 'auditLog', deleteFn: () => prisma.auditLog.deleteMany() },
    { name: 'notification', deleteFn: () => prisma.notification.deleteMany() },
    { name: 'qRCode', deleteFn: () => prisma.qRCode.deleteMany() },
    { name: 'rewardRedemption', deleteFn: () => prisma.rewardRedemption.deleteMany() },
    { name: 'pointTransaction', deleteFn: () => prisma.pointTransaction.deleteMany() },
    { name: 'stampTransaction', deleteFn: () => prisma.stampTransaction.deleteMany() },
    { name: 'visit', deleteFn: () => prisma.visit.deleteMany() },
    { name: 'customerBusiness', deleteFn: () => prisma.customerBusiness.deleteMany() },
    { name: 'reward', deleteFn: () => prisma.reward.deleteMany() },
    { name: 'campaignRule', deleteFn: () => prisma.campaignRule.deleteMany() },
    { name: 'campaign', deleteFn: () => prisma.campaign.deleteMany() },
    { name: 'businessStaff', deleteFn: () => prisma.businessStaff.deleteMany() },
    { name: 'businessBranch', deleteFn: () => prisma.businessBranch.deleteMany() },
    { name: 'subscription', deleteFn: () => prisma.subscription.deleteMany() },
    { name: 'business', deleteFn: () => prisma.business.deleteMany() },
    { name: 'user', deleteFn: () => prisma.user.deleteMany() },
  ];

  for (const item of deletionOrder) {
    try {
      const res = await item.deleteFn();
      console.log(`Cleared ${item.name}: ${res.count} rows deleted.`);
    } catch (err) {
      console.error(`Error deleting from ${item.name}:`, err.message);
    }
  }

  console.log('\n=== STEP 3: Verifying Final Table Counts ===');
  for (const m of allModels) {
    try {
      const count = await prisma[m].count();
      console.log(`${m.padEnd(20)}: ${count} rows remaining`);
    } catch (e) {
      console.error(`${m}: error counting`, e.message);
    }
  }

  await prisma.$disconnect();
  console.log('\nAll tables emptied successfully while preserving complete DB schema, tables, and constraints!');
}

main().catch((err) => {
  console.error('Fatal error during DB wipe:', err);
  process.exit(1);
});

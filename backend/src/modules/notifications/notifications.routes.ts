import { Router, Response } from 'express';
import prisma from '../../lib/prisma';
import { sendSuccess } from '../../utils/response';
import { authenticate, AuthenticatedRequest } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });
  const unreadCount = await prisma.notification.count({
    where: { userId: req.user!.userId, isRead: false },
  });
  sendSuccess(res, { items: notifications, unreadCount }, 'Notifications retrieved');
});

router.patch('/:id/read', async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const updated = await prisma.notification.updateMany({
    where: { id, userId: req.user!.userId },
    data: { isRead: true },
  });
  sendSuccess(res, updated, 'Notification marked as read');
});

router.patch('/read-all', async (req: AuthenticatedRequest, res: Response) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.userId, isRead: false },
    data: { isRead: true },
  });
  sendSuccess(res, null, 'All notifications marked as read');
});

export default router;

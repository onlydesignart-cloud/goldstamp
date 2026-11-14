import prisma from './prisma';
import { NotificationChannel } from '@prisma/client';

export interface SendNotificationOptions {
  userId: string;
  title: string;
  message: string;
  type?: string;
  channel?: NotificationChannel;
  metadata?: Record<string, any>;
}

export interface INotificationProvider {
  send(options: SendNotificationOptions): Promise<boolean>;
}

export class WhatsAppProvider implements INotificationProvider {
  async send(options: SendNotificationOptions): Promise<boolean> {
    console.log(`[Notification:WhatsApp] Sending to user ${options.userId}: ${options.title} - ${options.message}`);
    return true;
  }
}

export class EmailProvider implements INotificationProvider {
  async send(options: SendNotificationOptions): Promise<boolean> {
    console.log(`[Notification:Email] Sending to user ${options.userId}: ${options.title} - ${options.message}`);
    return true;
  }
}

export class NotificationService {
  private whatsappProvider = new WhatsAppProvider();
  private emailProvider = new EmailProvider();

  async notify(options: SendNotificationOptions): Promise<void> {
    try {
      // 1. Always persist In-App notification
      await prisma.notification.create({
        data: {
          userId: options.userId,
          title: options.title,
          message: options.message,
          type: options.type || 'SYSTEM',
          channel: options.channel || NotificationChannel.IN_APP,
          metadata: options.metadata ? JSON.stringify(options.metadata) : null,
        },
      });

      // 2. Dispatch to external channel if specified
      if (options.channel === NotificationChannel.WHATSAPP) {
        await this.whatsappProvider.send(options);
      } else if (options.channel === NotificationChannel.EMAIL) {
        await this.emailProvider.send(options);
      }
    } catch (error) {
      console.error('Failed to dispatch notification:', error);
    }
  }
}

export const notificationService = new NotificationService();

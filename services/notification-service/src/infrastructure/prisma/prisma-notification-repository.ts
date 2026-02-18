import prisma from '../../lib/prisma';
import type { NotificationRepository } from '../../application/ports/notification-repository';

export function createPrismaNotificationRepository(): NotificationRepository {
    return {
        async createPending(input) {
            await prisma.notification.create({
                data: {
                    userId: input.userId,
                    bookingId: input.bookingId,
                    type: input.type,
                    channel: 'EMAIL',
                    to: input.to,
                    subject: input.subject,
                    payload: (input.payload ?? {}) as object,
                    status: 'PENDING',
                },
            });
        },
    };
}

import express from 'express';
import { consulRegisterService, createCorrelationIdMiddleware, createErrorHandler, Logger, loadEnvProfile } from '@travel-web/shared';

import { startEmailWorker } from './lib/email-worker';
import { startNotificationConsumers } from './interfaces/events/notification-consumers';
import { createHealthRouter } from './interfaces/http/health.routes';

const app = express();
const PORT = process.env.PORT || 3006;
const logger = new Logger('NotificationService');

// Load root env + selected profile env (.env.docker/.env.supabase)
// In docker-compose, env can also be injected by the container; this won't override existing vars.
loadEnvProfile({ cwd: process.cwd().split(/[/\\]services[/\\]/)[0] || process.cwd() });

app.use(express.json());
app.use(createCorrelationIdMiddleware());
app.use(createHealthRouter());

// ─── Admin test-email endpoint ───────────────────────────────────────────────
app.post('/api/test/email', async (req, res) => {
    try {
        const { default: prisma } = await import('./lib/prisma');
        const { type, email, name } = req.body || {};

        if (!type || !email) {
            return res.status(400).json({ success: false, error: 'type and email are required' });
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof email !== 'string' || !emailRegex.test(email)) {
            return res.status(400).json({ success: false, error: 'Invalid email format' });
        }

        // Map frontend friendly names → backend notification event types
        const typeMap: Record<string, string> = {
            'booking-confirmation': 'BookingCreated',
            'check-in-reminder': 'BookingConfirmed',
            'cancellation': 'BookingCancelled',
        };
        const notificationType = typeMap[type] || type;

        const notification = await prisma.notification.create({
            data: {
                type: notificationType,
                to: email,
                subject: `[TEST] Email mẫu - ${type}`,
                payload: {
                    name: name || 'Khách hàng',
                    checkIn: new Date(Date.now() + 7 * 86400000).toISOString(),
                    checkOut: new Date(Date.now() + 9 * 86400000).toISOString(),
                    totalPrice: 2500000,
                    paymentMethod: 'Thẻ tín dụng',
                },
                bookingId: null,
                status: 'PENDING',
            },
        });

        logger.info('Test email queued', { id: notification.id, type: notificationType, to: email });

        res.json({
            success: true,
            message: `Email test "${type}" đã được đưa vào hàng đợi gửi đến ${email}`,
            notificationId: notification.id,
        });
    } catch (err) {
        logger.error('Test email endpoint error', err as Error);
        res.status(500).json({ success: false, error: 'Failed to queue test email' });
    }
});

app.use(createErrorHandler('notification-service'));

app.listen(PORT, () => {
    console.log(`Notification service running on port ${PORT}`);
    startNotificationConsumers().catch((err) => logger.error('Failed to start consumers', err as Error));

    // Background worker to send emails and transition notifications: PENDING -> SENT/FAILED (with retries).
    startEmailWorker().catch((err) => logger.error('Email worker failed to start', err as Error));

    if (process.env.SERVICE_DISCOVERY_MODE === 'consul') {
        consulRegisterService({
            serviceName: 'notificationService',
            port: Number(PORT),
            healthCheckPath: '/health',
        }).catch((err) => logger.error('Consul register failed', err as Error));
    }
});

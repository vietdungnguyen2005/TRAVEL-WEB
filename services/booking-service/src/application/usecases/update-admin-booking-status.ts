import crypto from 'crypto';
import type { EventMessage } from '@travel-web/contracts';
import type { BookingStatus } from '../../domain/booking';
import type { BookingRepository } from '../ports/booking-repository';
import type { OutboxRepository } from '../ports/outbox-repository';
import type { UnitOfWork } from '../ports/unit-of-work';

export async function updateAdminBookingStatus(deps: {
    uow: UnitOfWork;
    bookings: BookingRepository;
    outbox: OutboxRepository;
    bookingId: string;
    status: BookingStatus;
}) {
    return deps.uow.transaction(async (tx) => {
        const updated = await deps.bookings.updateStatus(tx, {
            id: deps.bookingId,
            status: deps.status,
            ...(deps.status === 'CONFIRMED' ? { paymentStatus: 'PENDING' } : {}),
        });

        const now = new Date().toISOString();

        const statusUpdatedOutboxId = crypto.randomUUID();
        const statusUpdated: EventMessage<'BookingStatusUpdated'> = {
            id: statusUpdatedOutboxId,
            type: 'BookingStatusUpdated',
            source: 'booking-service',
            occurredAt: now,
            version: 1,
            correlationId: updated.id,
            data: {
                bookingId: updated.id,
                userId: updated.userId,
                roomId: updated.roomId,
                status: updated.status,
                paymentStatus: updated.paymentStatus,
            },
        };

        await deps.outbox.create(tx, {
            id: statusUpdatedOutboxId,
            aggregateType: 'booking',
            aggregateId: updated.id,
            eventType: 'status.updated',
            payload: statusUpdated,
        });

        if (deps.status === 'CONFIRMED') {
            const confirmedOutboxId = crypto.randomUUID();
            const confirmed: EventMessage<'BookingConfirmed'> = {
                id: confirmedOutboxId,
                type: 'BookingConfirmed',
                source: 'booking-service',
                occurredAt: now,
                version: 1,
                correlationId: updated.id,
                data: {
                    bookingId: updated.id,
                    userId: updated.userId,
                    roomId: updated.roomId,
                    status: updated.status,
                    paymentStatus: updated.paymentStatus,
                },
            };

            await deps.outbox.create(tx, {
                id: confirmedOutboxId,
                aggregateType: 'booking',
                aggregateId: updated.id,
                eventType: 'confirmed',
                payload: confirmed,
            });
        }

        return updated;
    });
}

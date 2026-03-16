import { describe, it, expect, vi } from 'vitest';
import { createBooking, type CreateBookingDeps, type CreateBookingParams } from '../application/usecases/create-booking';
import type { BookingRepository } from '../application/ports/booking-repository';
import type { OutboxRepository } from '../application/ports/outbox-repository';
import type { UnitOfWork } from '../application/ports/unit-of-work';
import type { Booking } from '../domain/booking';

/* ── Mock helpers ── */

function mockUow(): UnitOfWork {
    return {
        async transaction<T>(fn: (tx: unknown) => Promise<T>): Promise<T> {
            return fn('mock-tx');
        },
    };
}

function mockBooking(overrides: Partial<Booking> = {}): Booking {
    return {
        id: 'booking-1',
        userId: 'user-1',
        roomId: 'room-1',
        checkIn: new Date('2026-04-01'),
        checkOut: new Date('2026-04-03'),
        numberOfGuests: 2,
        totalPrice: 500000,
        status: 'ON_HOLD',
        holdExpiresAt: null,
        paymentStatus: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
}

function mockBookingsRepo(overrides: Partial<BookingRepository> = {}): BookingRepository {
    return {
        findManyByUserId: vi.fn().mockResolvedValue([]),
        findManyAll: vi.fn().mockResolvedValue([]),
        findById: vi.fn().mockResolvedValue(null),
        findFirstConflict: vi.fn().mockResolvedValue(null),
        findFirstConflictTx: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(mockBooking()),
        update: vi.fn().mockResolvedValue(mockBooking()),
        ...overrides,
    };
}

function mockOutboxRepo(): OutboxRepository {
    return {
        create: vi.fn().mockResolvedValue(undefined),
    };
}

const defaultParams: CreateBookingParams = {
    userId: 'user-1',
    roomId: 'room-1',
    checkIn: new Date('2026-04-01'),
    checkOut: new Date('2026-04-03'),
    numberOfGuests: 2,
    totalPrice: 500000,
};

/* ── Tests ── */

describe('createBooking usecase', () => {
    it('should create a booking when no conflict exists', async () => {
        const bookings = mockBookingsRepo();
        const outbox = mockOutboxRepo();
        const deps: CreateBookingDeps = {
            uow: mockUow(),
            bookings,
            outbox,
        };

        const result = await createBooking(deps, defaultParams);

        expect(result).toBeDefined();
        expect(result.id).toBe('booking-1');
        expect(bookings.findFirstConflictTx).toHaveBeenCalledOnce();
        expect(bookings.create).toHaveBeenCalledOnce();
        expect(outbox.create).toHaveBeenCalledOnce();
    });

    it('should throw ConflictError when room is already booked', async () => {
        const bookings = mockBookingsRepo({
            findFirstConflictTx: vi.fn().mockResolvedValue(mockBooking({ id: 'existing-booking' })),
        });
        const deps: CreateBookingDeps = {
            uow: mockUow(),
            bookings,
            outbox: mockOutboxRepo(),
        };

        await expect(createBooking(deps, defaultParams))
            .rejects.toThrow(/already booked/i);

        // Should NOT have called create
        expect(bookings.create).not.toHaveBeenCalled();
    });

    it('should run conflict check and create inside the same transaction', async () => {
        const txLog: string[] = [];

        const bookings = mockBookingsRepo({
            findFirstConflictTx: vi.fn().mockImplementation(async (tx: unknown) => {
                txLog.push(`conflict-check:${tx}`);
                return null;
            }),
            create: vi.fn().mockImplementation(async (tx: unknown) => {
                txLog.push(`create:${tx}`);
                return mockBooking();
            }),
        });

        const outbox: OutboxRepository = {
            create: vi.fn().mockImplementation(async (tx: unknown) => {
                txLog.push(`outbox:${tx}`);
            }),
        };

        const deps: CreateBookingDeps = { uow: mockUow(), bookings, outbox };
        await createBooking(deps, defaultParams);

        // All operations should have used the same transaction context
        expect(txLog).toEqual([
            'conflict-check:mock-tx',
            'create:mock-tx',
            'outbox:mock-tx',
        ]);
    });

    it('should create outbox event with booking data', async () => {
        const outbox = mockOutboxRepo();
        const deps: CreateBookingDeps = {
            uow: mockUow(),
            bookings: mockBookingsRepo(),
            outbox,
        };

        await createBooking(deps, defaultParams);

        expect(outbox.create).toHaveBeenCalledOnce();
        const call = (outbox.create as ReturnType<typeof vi.fn>).mock.calls[0];
        // outbox.create(tx, { id, aggregateType, aggregateId, eventType, payload })
        const outboxRow = call.find((arg: any) => arg && typeof arg === 'object' && 'eventType' in arg);
        expect(outboxRow).toBeDefined();
        expect(outboxRow.eventType).toBe('booking.created');
        expect(outboxRow.aggregateType).toBe('Booking');
        expect(outboxRow.aggregateId).toBe('booking-1');
        // Nested EventMessage payload
        const event = outboxRow.payload;
        expect(event.type).toBe('booking.created');
        expect(event.source).toBe('booking-service');
        expect(event.data).toBeDefined();
        expect(event.data.bookingId).toBe('booking-1');
    });

    it('should create ON_HOLD booking with holdExpiresAt', async () => {
        const holdDate = new Date('2026-04-01T12:30:00Z');
        const booking = mockBooking({ status: 'ON_HOLD', holdExpiresAt: holdDate });
        const bookings = mockBookingsRepo({
            create: vi.fn().mockResolvedValue(booking),
        });
        const deps: CreateBookingDeps = {
            uow: mockUow(),
            bookings,
            outbox: mockOutboxRepo(),
        };

        const result = await createBooking(deps, {
            ...defaultParams,
            status: 'ON_HOLD',
            holdExpiresAt: holdDate,
        });

        expect(result.status).toBe('ON_HOLD');
        expect(result.holdExpiresAt).toEqual(holdDate);
    });
});

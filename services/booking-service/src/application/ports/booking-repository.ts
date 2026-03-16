import type { Booking, BookingStatus } from '../../domain/booking';
import type { TransactionContext } from './unit-of-work';

export type BookingConflictQuery = {
    roomId: string;
    checkIn: Date;
    checkOut: Date;
    excludeBookingId?: string;
};

export type CreateBookingInput = {
    userId: string;
    roomId: string;
    checkIn: Date;
    checkOut: Date;
    numberOfGuests: number;
    totalPrice: unknown;
    status: BookingStatus;
    holdExpiresAt?: Date | null;
};

export type BookingRepository = {
    findManyByUserId(userId: string): Promise<Booking[]>;
    findManyAll(filter?: { userId?: string; status?: BookingStatus }): Promise<Booking[]>;
    findFirstConflict(query: BookingConflictQuery): Promise<Booking | null>;
    /**
     * Same as findFirstConflict but runs inside a transaction with
     * row-level locking (SELECT ... FOR UPDATE) to prevent race conditions
     * when two concurrent requests try to book the same room for overlapping dates.
     */
    findFirstConflictTx(tx: TransactionContext, query: BookingConflictQuery): Promise<Booking | null>;
    findActiveBookingsForRooms(roomIds: string[]): Promise<Booking[]>;

    create(tx: TransactionContext, input: CreateBookingInput): Promise<Booking>;
    updateStatus(tx: TransactionContext, input: { id: string; status: BookingStatus; paymentStatus?: string | null }): Promise<Booking>;
    updatePaymentStatus(tx: TransactionContext, input: { id: string; paymentStatus: string }): Promise<Booking>;
    getById(id: string): Promise<Booking | null>;
    findExpiredOnHold(now: Date): Promise<Booking[]>;
};

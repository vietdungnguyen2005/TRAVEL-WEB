import type { TransactionContext } from './unit-of-work';

export type OutboxRepository = {
    create(tx: TransactionContext, input: {
        id: string;
        aggregateType: string;
        aggregateId: string;
        eventType: string;
        payload: unknown;
    }): Promise<void>;
};

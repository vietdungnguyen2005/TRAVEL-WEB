export type TransactionContext = unknown;

export type UnitOfWork = {
    transaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T>;
};

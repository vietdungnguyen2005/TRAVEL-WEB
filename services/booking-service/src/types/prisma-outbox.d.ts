// Ensures TypeScript knows about the `outbox` delegate even when Prisma Client types aren't regenerated in this workspace.
// This is a temporary workaround until Prisma tooling is pinned/standardized across the repo.

declare module '@prisma/client' {
    interface PrismaClient {
        booking: unknown;
        outbox: unknown;
        $transaction: unknown;
    }
}

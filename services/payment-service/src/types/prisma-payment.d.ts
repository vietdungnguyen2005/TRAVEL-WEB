// Temporary type augmentation for PrismaClient delegates used in this service.
// This avoids build breaks when Prisma Client types aren't regenerated in the workspace.

declare module '@prisma/client' {
    interface PrismaClient {
        payment: unknown;
        $transaction: unknown;
    }
}

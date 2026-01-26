// Allows TypeScript to compile before `prisma generate` creates the output directory.
// At runtime this is resolved from node_modules/.prisma/notification-client.
declare module '.prisma/notification-client' {
    export * from '@prisma/client';
}

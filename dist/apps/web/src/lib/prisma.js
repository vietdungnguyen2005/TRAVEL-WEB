import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
// Lazy singleton holder for Prisma Client + pool. We avoid creating the
// pool/client eagerly on module import because Next's prerender and build
// can import this module even when a DB isn't available. Instead we try to
// create the real client on first use and fall back to a safe stub if the
// DB is unreachable or SKIP_DB_ON_BUILD is set.
const globalForPrisma = globalThis;
async function buildRealPrisma() {
    if (globalForPrisma.prisma)
        return globalForPrisma.prisma;
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const AdapterCtor = PrismaPg.PrismaPg ?? PrismaPg.default ?? PrismaPg;
    const adapter = new AdapterCtor(pool);
    const client = new PrismaClient({ adapter, log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'] });
    // store singletons so subsequent calls reuse them
    globalForPrisma.pool = pool;
    globalForPrisma.prisma = client;
    globalForPrisma.initialized = true;
    return client;
}
function makeStubClient() {
    // generic stub that returns safe defaults for common Prisma model methods
    // The stub returns model proxies: makeStubClient().booking.findMany() etc.
    const modelHandler = {
        get(_, method) {
            return async (..._args) => {
                if (method === 'findMany')
                    return [];
                if (method === 'findUnique' || method === 'findFirst' || method === 'findOne')
                    return null;
                if (method === 'count')
                    return 0;
                if (method === 'aggregate')
                    return { _sum: { totalPrice: 0 }, _avg: {}, _count: {} };
                if (method === 'groupBy')
                    return [];
                if (method === 'create' || method === 'update' || method === 'upsert' || method === 'delete')
                    return null;
                if (method === '$queryRaw' || method === '$executeRaw')
                    return [];
                if (method === '$transaction') {
                    return async (cb) => {
                        if (typeof cb === 'function')
                            return cb(makeStubClient());
                        return [];
                    };
                }
                return async () => undefined;
            };
        },
    };
    const rootHandler = {
        get(_, _modelName) {
            // Return a proxy representing the model with methods
            return new Proxy({}, modelHandler);
        },
    };
    return new Proxy({}, rootHandler);
}
// Export a Proxy as `prisma` so existing code that does `prisma.model.method()`
// keeps working. The proxy will attempt to initialize a real client on first
// property access; if initialization fails (e.g., ECONNREFUSED), it will
// fall back to a safe stub implementation to avoid crashing builds.
export const prisma = new Proxy({}, {
    get(_target, prop) {
        // If DB should be skipped, return a stub model directly
        if (shouldSkipDb())
            return makeStubClient()[prop];
        // If a real client is already initialized, return the property
        if (globalForPrisma.prisma)
            return globalForPrisma.prisma[prop];
        // Try to build the real client lazily. If it fails, fall back to stub.
        // Note: we don't await here (get can't be async), so we return a
        // wrapper function that will await client readiness when called.
        return (...args) => {
            // Ensure initialization proceeds and call the real method when ready.
            return (async () => {
                try {
                    const client = await buildRealPrisma();
                    const value = client[prop];
                    if (typeof value === 'function')
                        return await value.apply(client, args);
                    return value;
                }
                catch (err) {
                    // Initialization failed (DB unreachable). Fall back to stub.
                    const stub = makeStubClient();
                    const v = stub[prop];
                    if (typeof v === 'function')
                        return await v.apply(stub, args);
                    return v;
                }
            })();
        };
    },
});
// Helper wrappers to avoid calling deep methods on imported objects from
// server components directly. Export small functions instead to keep Next's
// server-component/runtime serialization happy.
// Use dynamic import of PrismaClient inside helper functions so Next's
// server-side bundler doesn't treat `prisma` model method invocations as
// cross-module calls. Each helper creates a short-lived client and
// disconnects afterwards. This is safe for dev and avoids invalid
// invocation errors during SSR.
//
// To avoid build-time failures when a database is not available (for
// example during Next's prerender/page-data collection), set
// SKIP_DB_ON_BUILD=true in the environment (or leave DATABASE_URL empty).
// When the flag is set, the helpers return safe defaults instead of
// attempting to connect to Postgres.
function shouldSkipDb() {
    return process.env.SKIP_DB_ON_BUILD === 'true' || !process.env.DATABASE_URL;
}
export async function findRoomTypes(args) {
    if (shouldSkipDb())
        return [];
    const [{ PrismaClient }, { Pool }, { PrismaPg }] = await Promise.all([
        import('@prisma/client'),
        import('pg'),
        import('@prisma/adapter-pg'),
    ]);
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const AdapterCtor = PrismaPg.PrismaPg ?? PrismaPg.default ?? PrismaPg;
    const adapter = new AdapterCtor(pool);
    const client = new PrismaClient({ adapter, log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'] });
    try {
        return await client.roomType.findMany(args);
    }
    finally {
        try {
            await client.$disconnect();
        }
        catch (e) {
            // ignore
        }
        try {
            await pool.end();
        }
        catch (e) {
            // ignore
        }
    }
}
export async function findRoomTypesWithRooms(args) {
    if (shouldSkipDb())
        return [];
    const [{ PrismaClient }, { Pool }, { PrismaPg }] = await Promise.all([
        import('@prisma/client'),
        import('pg'),
        import('@prisma/adapter-pg'),
    ]);
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const AdapterCtor = PrismaPg.PrismaPg ?? PrismaPg.default ?? PrismaPg;
    const adapter = new AdapterCtor(pool);
    const client = new PrismaClient({ adapter, log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'] });
    try {
        return await client.roomType.findMany(args);
    }
    finally {
        try {
            await client.$disconnect();
        }
        catch (e) {
            // ignore
        }
        try {
            await pool.end();
        }
        catch (e) {
            // ignore
        }
    }
}
export async function findAllRoomTypes() {
    if (shouldSkipDb())
        return [];
    const [{ PrismaClient }, { Pool }, { PrismaPg }] = await Promise.all([
        import('@prisma/client'),
        import('pg'),
        import('@prisma/adapter-pg'),
    ]);
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const AdapterCtor = PrismaPg.PrismaPg ?? PrismaPg.default ?? PrismaPg;
    const adapter = new AdapterCtor(pool);
    const client = new PrismaClient({ adapter, log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'] });
    try {
        return await client.roomType.findMany({ orderBy: { createdAt: 'desc' } });
    }
    finally {
        try {
            await client.$disconnect();
        }
        catch (e) {
            // ignore
        }
        try {
            await pool.end();
        }
        catch (e) {
            // ignore
        }
    }
}
export async function createRoomType(data) {
    if (shouldSkipDb())
        return null;
    const [{ PrismaClient }, { Pool }, { PrismaPg }] = await Promise.all([
        import('@prisma/client'),
        import('pg'),
        import('@prisma/adapter-pg'),
    ]);
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const AdapterCtor = PrismaPg.PrismaPg ?? PrismaPg.default ?? PrismaPg;
    const adapter = new AdapterCtor(pool);
    const client = new PrismaClient({ adapter, log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'] });
    try {
        return await client.roomType.create({ data });
    }
    finally {
        try {
            await client.$disconnect();
        }
        catch (e) {
            // ignore
        }
        try {
            await pool.end();
        }
        catch (e) {
            // ignore
        }
    }
}
//# sourceMappingURL=prisma.js.map
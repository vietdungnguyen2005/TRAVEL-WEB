import { discoveryConfig, DiscoveryMode } from '../config/discovery.config';
import { services as staticServices } from '../config/services.config';
import { consulGetHealthyInstances } from './consul.client';

type ServiceName = keyof typeof staticServices;

type RegistryInstance = {
    id: string;
    address: string;
    port: number;
};

type CacheEntry = {
    instances: RegistryInstance[];
    expiresAt: number;
    rr: number;
};

const cache = new Map<string, CacheEntry>();

function toUrl(i: RegistryInstance) {
    return `http://${i.address}:${i.port}`;
}

async function resolveFromConsul(serviceKey: ServiceName) {
    const now = Date.now();
    const cached = cache.get(serviceKey);
    if (cached && cached.expiresAt > now) return cached;

    const instances = await consulGetHealthyInstances(discoveryConfig.consulUrl, serviceKey);
    const entry: CacheEntry = {
        instances,
        expiresAt: now + discoveryConfig.refreshMs,
        rr: cached?.rr ?? 0,
    };
    cache.set(serviceKey, entry);
    return entry;
}

function rrPick(entry: CacheEntry) {
    if (!entry.instances.length) return null;
    entry.rr = (entry.rr + 1) % entry.instances.length;
    const picked = entry.instances[entry.rr];
    return picked ? toUrl(picked) : null;
}

export async function getServiceTarget(serviceKey: ServiceName, mode?: DiscoveryMode) {
    const m = mode || discoveryConfig.mode;
    if (m === 'static') return staticServices[serviceKey];

    const entry = await resolveFromConsul(serviceKey);
    const target = rrPick(entry);
    if (target) return target;

    // Production-like behavior: if discovery is enabled and no instances are healthy,
    // fail fast instead of silently routing to a possibly stale static URL.
    throw new Error(`[discovery] No passing instances for service '${serviceKey}' via Consul`);
}

// Used only as an initial placeholder for http-proxy-middleware setup/logging.
// Actual routing is handled dynamically via getServiceTarget() in proxy router().
export function getServicePlaceholderTarget(serviceKey: ServiceName) {
    return staticServices[serviceKey];
}

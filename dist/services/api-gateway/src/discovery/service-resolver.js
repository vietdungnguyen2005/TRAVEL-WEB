import { discoveryConfig } from '../config/discovery.config';
import { services as staticServices } from '../config/services.config';
import { consulGetHealthyInstances } from './consul.client';
const cache = new Map();
function toUrl(i) {
    return `http://${i.address}:${i.port}`;
}
async function resolveFromConsul(serviceKey) {
    const now = Date.now();
    const cached = cache.get(serviceKey);
    if (cached && cached.expiresAt > now)
        return cached;
    const instances = await consulGetHealthyInstances(discoveryConfig.consulUrl, serviceKey);
    const entry = {
        instances,
        expiresAt: now + discoveryConfig.refreshMs,
        rr: cached?.rr ?? 0,
    };
    cache.set(serviceKey, entry);
    return entry;
}
function rrPick(entry) {
    if (!entry.instances.length)
        return null;
    entry.rr = (entry.rr + 1) % entry.instances.length;
    const picked = entry.instances[entry.rr];
    return picked ? toUrl(picked) : null;
}
export async function getServiceTarget(serviceKey, mode) {
    const m = mode || discoveryConfig.mode;
    if (m === 'static')
        return staticServices[serviceKey];
    const entry = await resolveFromConsul(serviceKey);
    const target = rrPick(entry);
    // fallback to static if consul has no passing instances
    return target || staticServices[serviceKey];
}
//# sourceMappingURL=service-resolver.js.map
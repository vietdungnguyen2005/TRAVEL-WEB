"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceTarget = getServiceTarget;
exports.getServicePlaceholderTarget = getServicePlaceholderTarget;
const discovery_config_1 = require("../config/discovery.config");
const services_config_1 = require("../config/services.config");
const consul_client_1 = require("./consul.client");
const cache = new Map();
function toUrl(i) {
    return `http://${i.address}:${i.port}`;
}
async function resolveFromConsul(serviceKey) {
    const now = Date.now();
    const cached = cache.get(serviceKey);
    if (cached && cached.expiresAt > now)
        return cached;
    const instances = await (0, consul_client_1.consulGetHealthyInstances)(discovery_config_1.discoveryConfig.consulUrl, serviceKey);
    const entry = {
        instances,
        expiresAt: now + discovery_config_1.discoveryConfig.refreshMs,
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
async function getServiceTarget(serviceKey, mode) {
    const m = mode || discovery_config_1.discoveryConfig.mode;
    if (m === 'static')
        return services_config_1.services[serviceKey];
    const entry = await resolveFromConsul(serviceKey);
    const target = rrPick(entry);
    if (target)
        return target;
    // Production-like behavior: if discovery is enabled and no instances are healthy,
    // fail fast instead of silently routing to a possibly stale static URL.
    throw new Error(`[discovery] No passing instances for service '${serviceKey}' via Consul`);
}
// Used only as an initial placeholder for http-proxy-middleware setup/logging.
// Actual routing is handled dynamically via getServiceTarget() in proxy router().
function getServicePlaceholderTarget(serviceKey) {
    return services_config_1.services[serviceKey];
}
//# sourceMappingURL=service-resolver.js.map
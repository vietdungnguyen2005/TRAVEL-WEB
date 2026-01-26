"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceTarget = getServiceTarget;
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
    // fallback to static if consul has no passing instances
    return target || services_config_1.services[serviceKey];
}
//# sourceMappingURL=service-resolver.js.map
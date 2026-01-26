export const discoveryConfig = {
    mode: process.env.SERVICE_DISCOVERY_MODE || 'static',
    consulUrl: process.env.CONSUL_URL || 'http://consul:8500',
    refreshMs: Number(process.env.DISCOVERY_REFRESH_MS || 10_000),
};
//# sourceMappingURL=discovery.config.js.map
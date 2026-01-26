"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.discoveryConfig = void 0;
exports.discoveryConfig = {
    mode: process.env.SERVICE_DISCOVERY_MODE || 'static',
    consulUrl: process.env.CONSUL_URL || 'http://consul:8500',
    refreshMs: Number(process.env.DISCOVERY_REFRESH_MS || 10000),
};
//# sourceMappingURL=discovery.config.js.map
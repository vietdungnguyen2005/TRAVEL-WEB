"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consulRegisterService = consulRegisterService;
exports.consulDeregisterService = consulDeregisterService;
const axios_1 = __importDefault(require("axios"));
const os_1 = __importDefault(require("os"));
const logger_1 = require("../logger");
const logger = new logger_1.Logger('ConsulRegister');
function getDefaultAddress() {
    // In Docker, the container name is often resolvable. As a fallback, use hostname.
    return process.env.SERVICE_HOST || os_1.default.hostname();
}
async function consulRegisterService(opts) {
    const consulUrl = (opts.consulUrl || process.env.CONSUL_URL || 'http://consul:8500').replace(/\/$/, '');
    const serviceId = opts.serviceId || `${opts.serviceName}-${os_1.default.hostname()}`;
    const address = opts.address || getDefaultAddress();
    const interval = opts.healthInterval || '10s';
    const deregisterAfter = opts.deregisterAfter || '1m';
    const healthPath = opts.healthCheckPath || '/health';
    const checkUrl = `http://${address}:${opts.port}${healthPath}`;
    const payload = {
        ID: serviceId,
        Name: opts.serviceName,
        Address: address,
        Port: opts.port,
        Tags: opts.tags || [],
        Check: {
            HTTP: checkUrl,
            Interval: interval,
            DeregisterCriticalServiceAfter: deregisterAfter,
        },
    };
    await axios_1.default.put(`${consulUrl}/v1/agent/service/register`, payload, { timeout: 4000 });
    logger.info('Registered service in Consul', { serviceName: opts.serviceName, serviceId, address, port: opts.port, checkUrl });
}
async function consulDeregisterService(serviceId, consulUrl) {
    const base = (consulUrl || process.env.CONSUL_URL || 'http://consul:8500').replace(/\/$/, '');
    await axios_1.default.put(`${base}/v1/agent/service/deregister/${encodeURIComponent(serviceId)}`, null, { timeout: 4000 });
    logger.info('Deregistered service from Consul', { serviceId });
}

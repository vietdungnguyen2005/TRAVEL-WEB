import axios from 'axios';
import os from 'os';
import { Logger } from '../logger';
const logger = new Logger('ConsulRegister');
function getDefaultAddress() {
    // In Docker, the container name is often resolvable. As a fallback, use hostname.
    return process.env.SERVICE_HOST || os.hostname();
}
export async function consulRegisterService(opts) {
    const consulUrl = (opts.consulUrl || process.env.CONSUL_URL || 'http://consul:8500').replace(/\/$/, '');
    const serviceId = opts.serviceId || `${opts.serviceName}-${os.hostname()}`;
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
    await axios.put(`${consulUrl}/v1/agent/service/register`, payload, { timeout: 4_000 });
    logger.info('Registered service in Consul', { serviceName: opts.serviceName, serviceId, address, port: opts.port, checkUrl });
}
export async function consulDeregisterService(serviceId, consulUrl) {
    const base = (consulUrl || process.env.CONSUL_URL || 'http://consul:8500').replace(/\/$/, '');
    await axios.put(`${base}/v1/agent/service/deregister/${encodeURIComponent(serviceId)}`, null, { timeout: 4_000 });
    logger.info('Deregistered service from Consul', { serviceId });
}
//# sourceMappingURL=consul-register.js.map
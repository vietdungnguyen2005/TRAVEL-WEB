import { Logger } from '@travel-web/shared';
const logger = new Logger('Health');
export function healthHandler(req, res) {
    res.status(200).json({ status: 'ok' });
}
export function readyHandler(req, res) {
    // TODO: add readiness checks (DB, RabbitMQ) if needed
    res.status(200).json({ status: 'ready' });
}
//# sourceMappingURL=health.js.map
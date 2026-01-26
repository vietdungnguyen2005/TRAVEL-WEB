import { Logger } from '@travel-web/shared';

const logger = new Logger('Health');

export function healthHandler(req: any, res: any) {
    res.status(200).json({ status: 'ok' });
}

export function readyHandler(req: any, res: any) {
    // TODO: add readiness checks (DB, RabbitMQ) if needed
    res.status(200).json({ status: 'ready' });
}

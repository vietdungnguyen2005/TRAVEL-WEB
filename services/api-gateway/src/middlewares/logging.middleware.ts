import type { NextFunction, Request, Response } from 'express';
import { Logger } from '@travel-web/shared';
import type { RequestWithId } from './requestId.middleware';

const logger = new Logger('api-gateway');

export function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
	const start = process.hrtime.bigint();
	const requestId = (req as RequestWithId).requestId;

	res.on('finish', () => {
		const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
		logger.info('request', {
			requestId,
			method: req.method,
			path: req.originalUrl || req.url,
			status: res.statusCode,
			durationMs: Math.round(durationMs),
			ip: req.ip,
			userAgent: req.header('user-agent'),
		});
	});

	next();
}

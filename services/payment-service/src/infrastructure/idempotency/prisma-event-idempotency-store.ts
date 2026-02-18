import prisma from '../../lib/prisma';
import { withEventIdempotency } from '@travel-web/shared';

export const prismaEventIdempotencyStore = {
	runOnce(
		key: {
			consumer: string;
			messageId: string;
			eventType?: string;
			routingKey?: string;
		},
		fn: () => Promise<void>,
	) {
		return withEventIdempotency(
			prisma as unknown as Parameters<typeof withEventIdempotency>[0],
			key,
			fn,
		);
	},
};

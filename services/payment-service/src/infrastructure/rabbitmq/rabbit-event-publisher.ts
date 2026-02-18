import { rabbitPublish } from '@travel-web/shared';
import type { EventPublisher, PublishOptions } from '../../application/ports/event-publisher';

export function createRabbitEventPublisher(): EventPublisher {
    return {
        async publish(routingKey: string, message: unknown, options?: PublishOptions) {
            await rabbitPublish({
                routingKey,
                message,
                options: options
                    ? {
                        messageId: options.messageId,
                        correlationId: options.correlationId,
                        headers: options.headers,
                    }
                    : undefined,
            });
        },
    };
}

import { getCorrelationId } from './observability/correlation';

type LogLevel = 'info' | 'warn' | 'error';

function toErrorPayload(error: unknown) {
  if (!error) return undefined;
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return { message: String(error) };
}

export class Logger {
  constructor(private context: string) { }

  private write(level: LogLevel, message: string, meta?: unknown, error?: unknown) {
    const correlationId = getCorrelationId();
    const payload: Record<string, unknown> = {
      ts: new Date().toISOString(),
      level,
      context: this.context,
      msg: message,
    };

    if (correlationId) payload.correlationId = correlationId;

    if (typeof meta !== 'undefined') payload.meta = meta;
    const err = toErrorPayload(error);
    if (err) payload.error = err;

    const line = JSON.stringify(payload);
    if (level === 'error') {
      console.error(line);
    } else if (level === 'warn') {
      console.warn(line);
    } else {
      console.log(line);
    }
  }

  info(message: string, meta?: unknown) {
    this.write('info', message, meta);
  }

  warn(message: string, meta?: unknown) {
    this.write('warn', message, meta);
  }

  error(message: string, error?: Error): void;
  error(message: string, meta?: unknown, error?: Error): void;
  error(message: string, metaOrError?: unknown, maybeError?: unknown) {
    if (metaOrError instanceof Error || typeof metaOrError === 'undefined') {
      this.write('error', message, undefined, metaOrError);
      return;
    }

    const error = maybeError instanceof Error ? maybeError : undefined;
    this.write('error', message, metaOrError, error);
  }
}
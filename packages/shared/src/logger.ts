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
    const payload: Record<string, unknown> = {
      ts: new Date().toISOString(),
      level,
      context: this.context,
      msg: message,
    };

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

  error(message: string, error?: Error) {
    this.write('error', message, undefined, error);
  }
}
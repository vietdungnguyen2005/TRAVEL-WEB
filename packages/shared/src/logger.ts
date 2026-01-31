export class Logger {
  constructor(private context: string) { }

  info(message: string, meta?: unknown) {
    if (typeof meta === 'undefined') {
      console.log(`[${this.context}] INFO:`, message);
      return;
    }

    console.log(`[${this.context}] INFO:`, message, meta);
  }

  error(message: string, error?: Error) {
    if (typeof error === 'undefined') {
      console.error(`[${this.context}] ERROR:`, message);
      return;
    }

    console.error(`[${this.context}] ERROR:`, message, error);
  }

  warn(message: string, meta?: unknown) {
    if (typeof meta === 'undefined') {
      console.warn(`[${this.context}] WARN:`, message);
      return;
    }

    console.warn(`[${this.context}] WARN:`, message, meta);
  }
}
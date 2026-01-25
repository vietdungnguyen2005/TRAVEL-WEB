export class Logger {
  constructor(private context: string) {}

  info(message: string, meta?: any) {
    console.log(`[${this.context}] INFO:`, message, meta);
  }

  error(message: string, error?: Error) {
    console.error(`[${this.context}] ERROR:`, message, error);
  }

  warn(message: string, meta?: any) {
    console.warn(`[${this.context}] WARN:`, message, meta);
  }
}
export interface LoggerPort {
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

export class ConsoleLoggerAdapter implements LoggerPort {
  debug(...args: unknown[]): void {
    this.log('debug', ...args);
  }

  info(...args: unknown[]): void {
    this.log('info', ...args);
  }

  warn(...args: unknown[]): void {
    this.log('warn', ...args);
  }

  error(...args: unknown[]): void {
    this.log('error', ...args);
  }

  private log(level: keyof LoggerPort, ...args: unknown[]) {
    console[level](`[${new Date().toLocaleString()}] [${level}]`, ...args);
  }
}

export class NoopLoggerAdapter implements LoggerPort {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private noop = () => {};

  debug = this.noop;
  info = this.noop;
  warn = this.noop;
  error = this.noop;
}

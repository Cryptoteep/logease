/**
 * logease — stream transport.
 *
 * Writes formatted lines to any `NodeJS.WritableStream`. Useful for piping
 * logease output into HTTP responses, custom duplex streams, etc.
 */
import type { LogLevel, Transport, LogRecord, Formatter } from '../types.js';

export interface StreamTransportOptions {
  level?: LogLevel;
  stream: NodeJS.WritableStream;
  formatter?: Formatter;
}

export class StreamTransport implements Transport {
  readonly name = 'stream';
  level?: LogLevel;
  formatter?: Formatter;
  private readonly stream: NodeJS.WritableStream;

  constructor(opts: StreamTransportOptions) {
    this.level = opts.level;
    this.formatter = opts.formatter;
    this.stream = opts.stream;
  }

  write(_record: LogRecord, formatted: string): void {
    try {
      this.stream.write(formatted + '\n');
    } catch {
      // swallow
    }
  }

  flush(): void {
    try {
      const s = this.stream as unknown as { flush?: () => void };
      s.flush?.();
    } catch {
      // ignore
    }
  }
}

/** Convenience factory. */
export const streamTransport = (opts: StreamTransportOptions) =>
  new StreamTransport(opts);

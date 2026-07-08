/**
 * logease — console transport.
 *
 * Routes records to stdout / stderr based on severity by default
 * (`trace`/`debug`/`info` → stdout, `warn`/`error`/`fatal` → stderr).
 */
import type { LogRecord, LogLevel, Transport, Formatter } from '../types.js';
import { gte } from '../core/levels.js';

export interface ConsoleTransportOptions {
  /** Minimum level (default: inherited from logger). */
  level?: LogLevel;
  /** Send `warn`/`error`/`fatal` to stderr (default: true). */
  stderrOnError?: boolean;
  /** Override the destination write stream for non-error records. */
  stdout?: NodeJS.WritableStream;
  /** Override the destination write stream for error records. */
  stderr?: NodeJS.WritableStream;
  /** Per-transport formatter (overrides the logger's formatter). */
  formatter?: Formatter;
}

export class ConsoleTransport implements Transport {
  readonly name = 'console';
  level?: LogLevel;
  formatter?: Formatter;
  private readonly stderrOnError: boolean;
  private readonly out: NodeJS.WritableStream;
  private readonly err: NodeJS.WritableStream;

  constructor(opts: ConsoleTransportOptions = {}) {
    this.level = opts.level;
    this.formatter = opts.formatter;
    this.stderrOnError = opts.stderrOnError ?? true;
    this.out = opts.stdout ?? process.stdout;
    this.err = opts.stderr ?? process.stderr;
  }

  write(record: LogRecord, formatted: string): void {
    const toStderr = this.stderrOnError && gte(record.level, 'warn');
    const stream = toStderr ? this.err : this.out;
    try {
      stream.write(formatted + '\n');
    } catch {
      // swallow — never let logging crash the app
    }
  }
}

/** Convenience factory. */
export const consoleTransport = (opts?: ConsoleTransportOptions) =>
  new ConsoleTransport(opts);

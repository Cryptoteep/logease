/**
 * logease — the core {@link Logger}.
 *
 * A logger holds an ordered list of transports, a minimum level, and a
 * shared context. Each level method (`info`, `warn`, …) builds a
 * {@link LogRecord}, filters it by level, formats it, and dispatches it
 * to every transport whose own level allows it.
 */
import type {
  Bindings,
  Formatter,
  LoggerOptions,
  LogRecord,
  LogLevel,
  Transport,
} from '../types.js';
import { asLevel, gte, LEVEL_PRIORITY } from './levels.js';
import { PrettyFormatter } from '../formatters/pretty.js';
import { ConsoleTransport } from '../transports/console.js';
import { TimerRegistry } from '../timer.js';

/** Per-call argument accepted by level methods. */
export type LogArg = string | Error | Record<string, unknown>;

export class Logger {
  readonly name: string;
  level: LogLevel;
  readonly transports: Transport[];
  readonly formatter: Formatter;
  readonly context: Record<string, unknown>;
  private readonly now: () => number;
  private readonly timers: TimerRegistry;

  constructor(opts: LoggerOptions = {}) {
    this.name = opts.name ?? 'app';
    this.level = asLevel(opts.level ?? 'info');
    this.now = opts.now ?? (() => Date.now());
    this.formatter =
      opts.formatter ??
      new PrettyFormatter(opts.color === false ? { colorLevel: 0 } : {});
    this.context = { ...(opts.context ?? {}) };
    this.transports = opts.transports ?? [new ConsoleTransport()];
    this.timers = new TimerRegistry(this.now);
  }

  /** True when `level` is at least as severe as this logger's level. */
  isLevelEnabled(level: LogLevel): boolean {
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[this.level];
  }

  /** Create a child logger with extra bound context. */
  child(bindings: Bindings = {}, name?: string): Logger {
    const child = new Logger({
      name: name ?? this.name,
      level: this.level,
      transports: this.transports,
      formatter: this.formatter,
      context: { ...this.context, ...bindings },
      now: this.now,
    });
    return child;
  }

  /** Build (but do not emit) a log record. Exposed for custom transports. */
  build(level: LogLevel, message: string, fields?: Bindings, error?: Error): LogRecord {
    const record: LogRecord = {
      level,
      message,
      timestamp: this.now(),
      name: this.name,
      context: this.context,
    };
    if (fields && Object.keys(fields).length) record.fields = fields;
    if (error) {
      record.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: (error as Error & { cause?: unknown }).cause,
      };
    }
    return record;
  }

  /** Emit a record to all matching transports. */
  log(record: LogRecord): void {
    if (!gte(record.level, this.level)) return;
    let defaultFormatted = '';
    for (const transport of this.transports) {
      const tl = transport.level;
      if (tl && !gte(record.level, tl)) continue;
      let formatted: string;
      try {
        if (transport.formatter) {
          formatted = transport.formatter.format(record);
        } else {
          if (!defaultFormatted) {
            defaultFormatted = this.formatter.format(record);
          }
          formatted = defaultFormatted;
        }
      } catch {
        formatted = `${record.level.toUpperCase()} ${record.message}`;
      }
      try {
        transport.write(record, formatted);
      } catch {
        // a single transport failure must never break others
      }
    }
  }

  // ---- level helpers -------------------------------------------------

  private emit(level: LogLevel, args: LogArg[]): void {
    if (!this.isLevelEnabled(level)) return;
    let message = '';
    let fields: Bindings | undefined;
    let error: Error | undefined;
    for (const a of args) {
      if (a instanceof Error) {
        error = a;
        if (!message) message = a.message;
      } else if (typeof a === 'string') {
        message = message ? `${message} ${a}` : a;
      } else if (a && typeof a === 'object') {
        fields = { ...(fields ?? {}), ...(a as Bindings) };
      }
    }
    this.log(this.build(level, message, fields, error));
  }

  trace = (...args: LogArg[]): void => this.emit('trace', args);
  debug = (...args: LogArg[]): void => this.emit('debug', args);
  info = (...args: LogArg[]): void => this.emit('info', args);
  warn = (...args: LogArg[]): void => this.emit('warn', args);
  error = (...args: LogArg[]): void => this.emit('error', args);
  fatal = (...args: LogArg[]): void => this.emit('fatal', args);

  // ---- timing --------------------------------------------------------

  /** Start a named timer. Returns the timer for chaining. */
  time(label: string): void {
    this.timers.time(label);
  }

  /** Stop a named timer and emit a record with the elapsed ms. */
  timeEnd(label: string, level: LogLevel = 'info'): void {
    const ms = this.timers.timeEnd(label);
    if (this.isLevelEnabled(level)) {
      const record = this.build(level, label);
      record.ms = ms;
      this.log(record);
    }
  }

  /** Measure the async duration of `fn`, logging `label` with elapsed ms. */
  async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const t = this.timers.time(label);
    try {
      return await fn();
    } finally {
      const ms = t.stop();
      if (this.isLevelEnabled('debug')) {
        const record = this.build('debug', label);
        record.ms = ms;
        this.log(record);
      }
    }
  }

  // ---- lifecycle -----------------------------------------------------

  /** Flush all transports that support it. */
  flush(): void {
    for (const t of this.transports) {
      try {
        t.flush?.();
      } catch {
        // ignore
      }
    }
  }

  /** Close all transports that support it. */
  close(): void {
    for (const t of this.transports) {
      try {
        t.close?.();
      } catch {
        // ignore
      }
    }
  }
}

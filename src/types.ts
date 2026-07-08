/**
 * logease — core type definitions.
 *
 * Everything exported here is part of the stable public API.
 */

/** Supported log severity levels, ordered from least to most severe. */
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/** A structured log record produced by a {@link Logger}. */
export interface LogRecord {
  /** Severity level of the record. */
  level: LogLevel;
  /** Human-readable primary message. */
  message: string;
  /** Epoch milliseconds the record was created at. */
  timestamp: number;
  /** Stable logger name / namespace. */
  name: string;
  /** Merged structured context (child + per-call bindings). */
  context: Record<string, unknown>;
  /** Optional per-call fields merged on top of context. */
  fields?: Record<string, unknown>;
  /** Optional error object attached via `logger.error(err)`. */
  error?: { name: string; message: string; stack?: string; cause?: unknown };
  /** Optional elapsed milliseconds, populated by timing helpers. */
  ms?: number;
}

/**
 * A formatter turns a {@link LogRecord} into a serialized string.
 * Implementations must be synchronous and side-effect free.
 */
export interface Formatter {
  format(record: LogRecord): string;
}

/**
 * A transport delivers a formatted log line somewhere
 * (stdout, a file, a remote endpoint, ...).
 *
 * Implementations should not throw on write failure; they should
 * swallow errors (optionally falling back to `process.stderr`).
 */
export interface Transport {
  /** Human-readable name, used for diagnostics. */
  readonly name: string;
  /** Minimum level this transport will emit. */
  level?: LogLevel;
  /**
   * Optional per-transport formatter. When set, the logger will call this
   * instead of its own formatter for records routed to this transport.
   * Enables hybrid setups, e.g. pretty console + JSON file.
   */
  formatter?: Formatter;
  /** Called once per record that passes level filtering. */
  write(record: LogRecord, formatted: string): void;
  /** Optional lifecycle hook called on `logger.close()`. */
  flush?(): void;
  /** Optional lifecycle hook called on `logger.close()`. */
  close?(): void;
}

/** Options accepted by the {@link Logger} constructor. */
export interface LoggerOptions {
  /** Minimum level to emit (default: `info`). */
  level?: LogLevel;
  /** Stable name / namespace shown in output. */
  name?: string;
  /** Transports to write to (default: a single pretty console transport). */
  transports?: Transport[];
  /** Formatter used by transports that need a serialized string. */
  formatter?: Formatter;
  /** Base context bindings inherited by all child loggers. */
  context?: Record<string, unknown>;
  /** Inject a custom timestamp source (useful for tests / reproducible builds). */
  now?: () => number;
  /** When `false`, disable color auto-detection (force plain output). */
  color?: boolean;
}

/** Bindings accepted by {@link Logger.child} and the per-call field spread. */
export type Bindings = Record<string, unknown>;

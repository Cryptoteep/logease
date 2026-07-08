/**
 * logease — newline-delimited JSON formatter.
 *
 * Produces a single-line JSON object per record, suitable for ingestion
 * by Loki, Elasticsearch, Datadog, CloudWatch, etc.
 */
import type { Formatter, LogRecord } from '../types.js';

export interface JsonFormatterOptions {
  /** Drop fields with `undefined` values (default: true). */
  dropUndefined?: boolean;
  /** Pretty-print with 2-space indentation (default: false, single line). */
  pretty?: boolean;
  /** Field name used for the message (default: `msg`). */
  messageKey?: string;
  /** Field name used for the timestamp (default: `time`). */
  timeKey?: string;
  /** Emit timestamp as ISO-8601 string instead of epoch ms (default: true). */
  isoTime?: boolean;
}

export class JsonFormatter implements Formatter {
  private readonly dropUndefined: boolean;
  private readonly pretty: boolean;
  private readonly messageKey: string;
  private readonly timeKey: string;
  private readonly isoTime: boolean;

  constructor(opts: JsonFormatterOptions = {}) {
    this.dropUndefined = opts.dropUndefined ?? true;
    this.pretty = opts.pretty ?? false;
    this.messageKey = opts.messageKey ?? 'msg';
    this.timeKey = opts.timeKey ?? 'time';
    this.isoTime = opts.isoTime ?? true;
  }

  format(record: LogRecord): string {
    const obj: Record<string, unknown> = {
      level: record.level,
      [this.messageKey]: record.message,
      [this.timeKey]: this.isoTime
        ? new Date(record.timestamp).toISOString()
        : record.timestamp,
      name: record.name,
    };

    const merged: Record<string, unknown> = {
      ...record.context,
      ...(record.fields ?? {}),
    };
    for (const [k, v] of Object.entries(merged)) {
      if (this.dropUndefined && v === undefined) continue;
      obj[k] = v;
    }

    if (typeof record.ms === 'number') obj.ms = record.ms;

    if (record.error) {
      obj.err = {
        name: record.error.name,
        message: record.error.message,
        stack: record.error.stack,
      };
    }

    try {
      return this.pretty
        ? JSON.stringify(obj, null, 2)
        : JSON.stringify(obj);
    } catch {
      return JSON.stringify({
        level: record.level,
        [this.messageKey]: record.message,
        [this.timeKey]: new Date(record.timestamp).toISOString(),
        name: record.name,
        _serializeError: 'log record was not serializable',
      });
    }
  }
}

/** Convenience factory. */
export const json = (opts?: JsonFormatterOptions) => new JsonFormatter(opts);

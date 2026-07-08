/**
 * logease — pretty, human-readable formatter with color support.
 */
import type { Formatter, LogRecord } from '../types.js';
import { LEVEL_LABEL } from '../core/levels.js';
import { type ColorTheme, pickTheme, resolveColorLevel } from '../colors.js';

export interface PrettyFormatterOptions {
  /** Color theme to use. Defaults to auto-detected. */
  theme?: ColorTheme;
  /** Override color level (0–3). Defaults to auto-detection against stdout. */
  colorLevel?: 0 | 1 | 2 | 3;
  /** Whether to print the timestamp. Default: true. */
  timestamp?: boolean;
  /** Whether to print the logger name. Default: true. */
  name?: boolean;
  /** Whether to inline structured context as `key=value` pairs. Default: true. */
  context?: boolean;
  /** Use 24h ISO local time instead of ISO-8601 UTC. Default: false (UTC). */
  localTime?: boolean;
}

/** Format a Date as an ISO-8601 UTC stamp `HH:mm:ss.SSS`. */
function stamp(ts: number, local: boolean): string {
  const d = new Date(ts);
  const p = (n: number, l = 2) => String(n).padStart(l, '0');
  const hh = p(d.getUTCHours());
  const mm = p(d.getUTCMinutes());
  const ss = p(d.getUTCSeconds());
  const ms = p(d.getUTCMilliseconds(), 3);
  if (local) {
    return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${ms}`;
  }
  return `${hh}:${mm}:${ss}.${ms}`;
}

/** Render a value for inline display. */
export function renderValue(v: unknown, theme: ColorTheme): string {
  if (v === null) return theme.dim('null');
  if (v === undefined) return theme.dim('undefined');
  if (typeof v === 'string') return theme.value(v);
  if (typeof v === 'number' || typeof v === 'boolean') return theme.value(String(v));
  if (v instanceof Error) return theme.value(`${v.name}: ${v.message}`);
  try {
    return theme.value(JSON.stringify(v));
  } catch {
    return theme.value(String(v));
  }
}

export class PrettyFormatter implements Formatter {
  private readonly theme: ColorTheme;
  private readonly showTs: boolean;
  private readonly showName: boolean;
  private readonly showCtx: boolean;
  private readonly local: boolean;

  constructor(opts: PrettyFormatterOptions = {}) {
    const level = opts.colorLevel ?? resolveColorLevel(process.stdout);
    this.theme = opts.theme ?? pickTheme(level);
    this.showTs = opts.timestamp ?? true;
    this.showName = opts.name ?? true;
    this.showCtx = opts.context ?? true;
    this.local = opts.localTime ?? false;
  }

  format(record: LogRecord): string {
    const t = this.theme;
    const parts: string[] = [];

    if (this.showTs) {
      parts.push(t.timestamp(stamp(record.timestamp, this.local)));
    }
    parts.push(t[record.level](LEVEL_LABEL[record.level]));

    if (this.showName && record.name) {
      parts.push(`${t.name(record.name)}`);
    }

    parts.push(record.message);

    if (this.showCtx) {
      const merged: Record<string, unknown> = {
        ...record.context,
        ...(record.fields ?? {}),
      };
      for (const [k, v] of Object.entries(merged)) {
        parts.push(`${t.key(k)}=${renderValue(v, t)}`);
      }
    }

    if (typeof record.ms === 'number') {
      parts.push(t.ms(`${record.ms}ms`));
    }

    let line = parts.join(' ');

    if (record.error) {
      const err = record.error;
      line += '\n' + t.dim('  ┌─ ' + err.name + ': ' + err.message);
      if (err.stack) {
        const frames = err.stack
          .split('\n')
          .slice(1)
          .map((l) => l.trim())
          .filter(Boolean)
          .slice(0, 6);
        for (const f of frames) {
          line += '\n' + t.dim('  │ ' + f);
        }
      }
      line += '\n' + t.dim('  └─');
    }

    return line;
  }
}

/** Convenience factory. */
export const pretty = (opts?: PrettyFormatterOptions) => new PrettyFormatter(opts);

/**
 * logease — minimal formatter.
 *
 * Just `LEVEL message` with optional context. Useful when you want color
 * cues without the timestamp/name noise (e.g. in embedded CLIs).
 */
import type { Formatter, LogRecord } from '../types.js';
import { LEVEL_LABEL } from '../core/levels.js';
import { pickTheme, resolveColorLevel, type ColorTheme } from '../colors.js';
import { renderValue } from './pretty.js';

export interface MinimalFormatterOptions {
  theme?: ColorTheme;
  colorLevel?: 0 | 1 | 2 | 3;
  context?: boolean;
}

export class MinimalFormatter implements Formatter {
  private readonly theme: ColorTheme;
  private readonly showCtx: boolean;

  constructor(opts: MinimalFormatterOptions = {}) {
    const level = opts.colorLevel ?? resolveColorLevel(process.stdout);
    this.theme = opts.theme ?? pickTheme(level);
    this.showCtx = opts.context ?? false;
  }

  format(record: LogRecord): string {
    const t = this.theme;
    const parts = [t[record.level](LEVEL_LABEL[record.level]), record.message];
    if (this.showCtx) {
      const merged: Record<string, unknown> = {
        ...record.context,
        ...(record.fields ?? {}),
      };
      for (const [k, v] of Object.entries(merged)) {
        parts.push(`${t.key(k)}=${renderValue(v, t)}`);
      }
    }
    return parts.join(' ');
  }
}

/** Convenience factory. */
export const minimal = (opts?: MinimalFormatterOptions) => new MinimalFormatter(opts);

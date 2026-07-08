/**
 * logease — log level definitions and ordering.
 */
import type { LogLevel } from '../types.js';

/** Numeric priority of each level. Higher = more severe. */
export const LEVEL_PRIORITY: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

/** All levels in severity order. */
export const LEVELS: readonly LogLevel[] = [
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'fatal',
] as const;

/** Short uppercase labels, padded for aligned column output. */
export const LEVEL_LABEL: Record<LogLevel, string> = {
  trace: 'TRACE',
  debug: 'DEBUG',
  info: ' INFO',
  warn: ' WARN',
  error: 'ERROR',
  fatal: 'FATAL',
};

const VALID = new Set<string>(LEVELS);

/** Coerce an unknown value into a level, falling back to `info`. */
export function asLevel(value: unknown): LogLevel {
  if (typeof value === 'string' && VALID.has(value)) return value as LogLevel;
  return 'info';
}

/** True when `a` is at least as severe as `b`. */
export function gte(a: LogLevel, b: LogLevel): boolean {
  return LEVEL_PRIORITY[a] >= LEVEL_PRIORITY[b];
}

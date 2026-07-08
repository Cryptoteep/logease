/**
 * logease — beautiful, zero-dependency structured logging for Node.js & TypeScript.
 *
 * @packageDocumentation
 */

export type {
  Bindings,
  Formatter,
  LogRecord,
  LogLevel,
  LoggerOptions,
  Transport,
} from './types.js';

export { LEVELS, LEVEL_PRIORITY, LEVEL_LABEL, asLevel, gte } from './core/levels.js';
export { Logger, type LogArg } from './core/logger.js';
export { Timer, TimerRegistry } from './timer.js';

export type { ColorTheme } from './colors.js';
export {
  colorTheme,
  plainTheme,
  pickTheme,
  resolveColorLevel,
} from './colors.js';

export {
  PrettyFormatter,
  pretty,
  renderValue,
  type PrettyFormatterOptions,
} from './formatters/pretty.js';
export {
  JsonFormatter,
  json,
  type JsonFormatterOptions,
} from './formatters/json.js';
export {
  MinimalFormatter,
  minimal,
  type MinimalFormatterOptions,
} from './formatters/minimal.js';

export {
  ConsoleTransport,
  consoleTransport,
  type ConsoleTransportOptions,
} from './transports/console.js';
export {
  StreamTransport,
  streamTransport,
  type StreamTransportOptions,
} from './transports/stream.js';
export {
  FileTransport,
  fileTransport,
  type FileTransportOptions,
} from './transports/file.js';

import { Logger } from './core/logger.js';
import { ConsoleTransport } from './transports/console.js';
import { PrettyFormatter } from './formatters/pretty.js';
import { JsonFormatter } from './formatters/json.js';
import { FileTransport } from './transports/file.js';

/**
 * A ready-to-use default logger writing pretty-colored output to stdout/stderr.
 * Configure via the `LOGEASE_LEVEL` env var (`trace`|`debug`|`info`|`warn`|`error`|`fatal`).
 */
export const log = new Logger({
  name: 'app',
  level: (process.env.LOGEASE_LEVEL as
    | 'trace'
    | 'debug'
    | 'info'
    | 'warn'
    | 'error'
    | 'fatal'
    | undefined) ?? 'info',
  formatter: new PrettyFormatter(),
  transports: [new ConsoleTransport()],
});

/** Build a logger that emits ND-JSON to stdout (great for production / log shippers). */
export function createJsonLogger(name = 'app', level: import('./types.js').LogLevel = 'info'): Logger {
  return new Logger({
    name,
    level,
    formatter: new JsonFormatter(),
    transports: [new ConsoleTransport({ stderrOnError: true })],
  });
}

/** Build a logger that writes pretty output to the console *and* JSON to a file. */
export function createHybridLogger(opts: {
  name?: string;
  level?: import('./types.js').LogLevel;
  file: string;
}): Logger {
  return new Logger({
    name: opts.name ?? 'app',
    level: opts.level ?? 'info',
    transports: [
      new ConsoleTransport(),
      new FileTransport({ path: opts.file, formatter: new JsonFormatter() }),
    ],
  });
}

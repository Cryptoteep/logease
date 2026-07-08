/**
 * logease — ANSI color & styling helpers.
 *
 * Zero dependencies. Color support is auto-detected from the environment
 * but can be overridden via the `FORCE_COLOR` / `NO_COLOR` conventions
 * (https://force-color.org, https://no-color.org).
 */

export interface ColorTheme {
  trace: (s: string) => string;
  debug: (s: string) => string;
  info: (s: string) => string;
  warn: (s: string) => string;
  error: (s: string) => string;
  fatal: (s: string) => string;
  timestamp: (s: string) => string;
  name: (s: string) => string;
  key: (s: string) => string;
  value: (s: string) => string;
  dim: (s: string) => string;
  bold: (s: string) => string;
  ms: (s: string) => string;
}

/** Resolve a color level: 0 = none, 1 = 16-color, 2 = 256-color, 3 = truecolor. */
export function resolveColorLevel(stream?: { isTTY?: boolean }): 0 | 1 | 2 | 3 {
  // FORCE_COLOR wins over NO_COLOR (matches Node.js & force-color.org behavior).
  const forced = process.env.FORCE_COLOR;
  if (forced !== undefined) {
    if (forced === '0' || forced === 'false') return 0;
    if (forced === '1') return 1;
    if (forced === '2') return 2;
    if (forced === '3') return 3;
    return 1;
  }
  if (process.env.NO_COLOR !== undefined) return 0;
  // Respect CI environments: most CI runners set CI=true and are NOT a TTY,
  // but GitHub Actions / GitLab CI do support color. We enable basic color
  // only when a TTY is actually present.
  if (process.env.CI !== undefined && !(stream && stream.isTTY)) return 0;
  if (!stream || !stream.isTTY) return 0;
  if (process.env.TERM === 'dumb') return 0;
  if (process.platform === 'win32') {
    const nv = Number.parseFloat(process.env.TERM_PROGRAM_VERSION ?? '0');
    if (process.env.WT_SESSION) return 3; // Windows Terminal
    if (process.env.ConEmuANSI === 'ON') return 2;
    if (nv >= 3) return 3; // VS Code, etc.
    return 2;
  }
  if (process.env.COLORTERM === 'truecolor') return 3;
  if (/\-256color$/.test(process.env.TERM ?? '')) return 2;
  return 1;
}

const wrap = (open: string, close: string) => (s: string) =>
  `\x1b[${open}m${s}\x1b[${close}m`;

const S = {
  reset: wrap('0', '0'),
  bold: wrap('1', '22'),
  dim: wrap('2', '22'),
  italic: wrap('3', '23'),
  underline: wrap('4', '24'),
  black: wrap('30', '39'),
  red: wrap('31', '39'),
  green: wrap('32', '39'),
  yellow: wrap('33', '39'),
  blue: wrap('34', '39'),
  magenta: wrap('35', '39'),
  cyan: wrap('36', '39'),
  white: wrap('37', '39'),
  gray: wrap('90', '39'),
  brightRed: wrap('91', '39'),
  brightGreen: wrap('92', '39'),
  brightYellow: wrap('93', '39'),
  brightCyan: wrap('96', '39'),
  bgRed: wrap('41', '49'),
};

const id = (s: string) => s;

/** A no-color theme used when color is disabled. */
export const plainTheme: ColorTheme = {
  trace: id,
  debug: id,
  info: id,
  warn: id,
  error: id,
  fatal: id,
  timestamp: id,
  name: id,
  key: id,
  value: id,
  dim: id,
  bold: id,
  ms: id,
};

/** The default 256/truecolor-friendly theme. */
export const colorTheme: ColorTheme = {
  trace: S.gray,
  debug: S.cyan,
  info: S.green,
  warn: S.yellow,
  error: S.red,
  fatal: (s) => S.bold(S.brightRed(S.bgRed(s.length ? s : ' '))),
  timestamp: S.dim,
  name: S.magenta,
  key: S.cyan,
  value: S.white,
  dim: S.dim,
  bold: S.bold,
  ms: S.brightCyan,
};

colorTheme.fatal = (s: string) => S.bold(S.bgRed(S.brightYellow(s)));

/** Pick a theme based on the desired color level. */
export function pickTheme(level: 0 | 1 | 2 | 3): ColorTheme {
  return level === 0 ? plainTheme : colorTheme;
}

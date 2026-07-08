/**
 * logease — file transport with size-based rotation.
 *
 * Writes to `path`. When the file exceeds `maxSize` bytes it is renamed to
 * `<path>.1` (cascading older files up to `maxFiles`), and a fresh file is
 * opened. All filesystem errors are swallowed and reported to stderr once.
 */
import { createWriteStream, type WriteStream } from 'node:fs';
import { mkdir, rename, stat, unlink } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { LogLevel, Transport, LogRecord, Formatter } from '../types.js';

export interface FileTransportOptions {
  /** Path to the log file. Parent dirs are created on demand. */
  path: string;
  /** Minimum level (default: inherited from logger). */
  level?: LogLevel;
  /** Rotate when the file reaches this many bytes (default: 10 MiB). */
  maxSize?: number;
  /** Keep this many rotated files: `<path>.1`, `<path>.2`, … (default: 5). */
  maxFiles?: number;
  /** Append (`a`) or truncate (`w`) on open (default: `a`). */
  flags?: string;
  /** Interval in ms between rotation checks (default: 1000). */
  rotationCheckInterval?: number;
  /** Per-transport formatter (overrides the logger's formatter). */
  formatter?: Formatter;
}

export class FileTransport implements Transport {
  readonly name = 'file';
  level?: LogLevel;
  formatter?: Formatter;
  private readonly path: string;
  private readonly maxSize: number;
  private readonly maxFiles: number;
  private readonly flags: string;
  private readonly checkEvery: number;
  private stream: WriteStream | null = null;
  private bytes = 0;
  private lastCheck = 0;
  private warned = false;

  constructor(opts: FileTransportOptions) {
    this.path = opts.path;
    this.level = opts.level;
    this.formatter = opts.formatter;
    this.maxSize = opts.maxSize ?? 10 * 1024 * 1024;
    this.maxFiles = opts.maxFiles ?? 5;
    this.flags = opts.flags ?? 'a';
    this.checkEvery = opts.rotationCheckInterval ?? 1000;
  }

  private async ensureOpen(): Promise<WriteStream | null> {
    if (this.stream && !this.stream.destroyed && this.stream.writable) {
      return this.stream;
    }
    try {
      await mkdir(dirname(this.path), { recursive: true });
      this.stream = createWriteStream(this.path, { flags: this.flags });
      this.bytes = 0;
      try {
        const st = await stat(this.path);
        this.bytes = st.size;
      } catch {
        // file may not exist yet
      }
      this.stream.on('error', () => {
        this.warnOnce(`logease: file transport error on ${this.path}`);
        this.stream = null;
      });
      return this.stream;
    } catch (err) {
      this.warnOnce(`logease: cannot open ${this.path}: ${(err as Error).message}`);
      return null;
    }
  }

  private warnOnce(msg: string): void {
    if (this.warned) return;
    this.warned = true;
    try {
      process.stderr.write(msg + '\n');
    } catch {
      // ignore
    }
  }

  private async maybeRotate(): Promise<void> {
    const now = Date.now();
    if (now - this.lastCheck < this.checkEvery) return;
    this.lastCheck = now;
    if (this.bytes < this.maxSize) return;

    const s = this.stream;
    if (s) {
      try {
        await new Promise<void>((res) => s.end(() => res()));
      } catch {
        // ignore
      }
      this.stream = null;
    }

    // cascade: .(n-1) -> .n, ..., .1 -> .2, current -> .1
    for (let i = this.maxFiles; i > 1; i--) {
      const from = `${this.path}.${i - 1}`;
      const to = `${this.path}.${i}`;
      try {
        await rename(from, to).catch(() => {});
      } catch {
        // ignore
      }
    }
    try {
      await rename(this.path, `${this.path}.1`).catch(() => {});
    } catch {
      // ignore
    }
    // delete files beyond maxFiles
    try {
      await unlink(`${this.path}.${this.maxFiles + 1}`).catch(() => {});
    } catch {
      // ignore
    }
    this.bytes = 0;
  }

  write(_record: LogRecord, formatted: string): void {
    const data = formatted + '\n';
    const len = Buffer.byteLength(data);
    this.bytes += len;
    // fire-and-forget rotation check
    this.maybeRotate().catch(() => {});
    this.ensureOpen()
      .then((s) => {
        if (!s) return;
        try {
          s.write(data);
        } catch {
          // swallow
        }
      })
      .catch(() => {
        // swallow
      });
  }

  flush(): void {
    const s = this.stream;
    if (s && !s.destroyed) {
      try {
        s.write('');
      } catch {
        // ignore
      }
    }
  }

  close(): void {
    const s = this.stream;
    if (s) {
      try {
        s.end();
      } catch {
        // ignore
      }
      this.stream = null;
    }
  }
}

/** Convenience factory. */
export const fileTransport = (opts: FileTransportOptions) => new FileTransport(opts);

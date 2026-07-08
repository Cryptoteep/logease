/**
 * logease — timing utilities.
 *
 * A `Timer` measures elapsed time and optionally logs it through a logger
 * when stopped. Independent of the {@link Logger} so it can be used standalone.
 */
export class Timer {
  private readonly start: number;
  private stopped = false;
  private _ms: number | null = null;

  constructor(private readonly now: () => number = Date.now) {
    this.start = now();
  }

  /** Elapsed milliseconds so far (live, even before stop). */
  get ms(): number {
    return this.stopped && this._ms !== null ? this._ms : this.now() - this.start;
  }

  /** Stop the timer and return elapsed ms. */
  stop(): number {
    if (this.stopped) return this._ms ?? 0;
    this._ms = this.now() - this.start;
    this.stopped = true;
    return this._ms;
  }

  /** Reset the timer start point. */
  reset(): this {
    this.stopped = false;
    this._ms = null;
    return this;
  }
}

/**
 * A registry of named timers, useful for `logger.time('foo')` / `logger.timeEnd('foo')`.
 */
export class TimerRegistry {
  private readonly timers = new Map<string, Timer>();

  constructor(private readonly now: () => number = Date.now) {}

  /** Start (or reset) a named timer. */
  time(label: string): Timer {
    const t = new Timer(this.now);
    this.timers.set(label, t);
    return t;
  }

  /** Stop a named timer and return elapsed ms (0 if missing). */
  timeEnd(label: string): number {
    const t = this.timers.get(label);
    if (!t) return 0;
    const ms = t.stop();
    this.timers.delete(label);
    return ms;
  }

  /** Peek elapsed ms of a running named timer without stopping it. */
  peek(label: string): number | null {
    const t = this.timers.get(label);
    return t ? t.ms : null;
  }

  /** Stop all running timers. */
  clear(): void {
    this.timers.clear();
  }
}

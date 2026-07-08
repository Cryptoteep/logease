# Roadmap

This document captures the direction logease is heading. It's a living
document — proposals are welcome via issues & discussions.

## Guiding principles

1. **Stay zero-dependency.** No feature is worth a runtime dependency.
   If a feature genuinely needs a dep, it ships as a separate package
   (e.g. `logease-http-transport`).
2. **Stay tiny.** The minified+gzip size of the core should never cross ~5 KB
   without a very good reason.
3. **Stay boring.** Predictable, well-typed, well-documented. No magic.
4. **Never crash.** A `log.*` call must never throw.

## Near term (0.x)

- [ ] **Field redaction** — `redact: ['password', '*.token']` with path globs.
- [ ] **Daily-rotating file transport** — rotate on date boundaries.
- [ ] **HTTP transport** — batch + flush with backpressure & retry.
- [ ] **logfmt formatter** — `key=value` for syslog-style systems.
- [ ] **Benchmarks** — `bench/` comparing logease vs pino / winston / console.
- [ ] **Browser build** — a `logease/browser` entry with a smaller color set
      and a `console`-based transport.
- [ ] **Streaming child logger** — `logger.child()` that emits a readable
      stream for test harnesses.

## Mid term (1.0)

- [ ] **Stable 1.0 API freeze.**
- [ ] **Async transports** — opt-in `writeAsync()` with a flush barrier so
      apps can guarantee delivery on shutdown.
- [ ] **Source maps** — resolve stack frames through source maps in errors.
- [ ] **Plugin package** — `create-logease-transport` generator for the
      community.

## Long term

- [ ] **OTLP export transport** — for OpenTelemetry collectors.
- [ ] **Structured sampling** — rate-limit noisy loggers without losing
      tail latencies.
- [ ] **WASM core** — explore a Rust→WASM formatter for very hot paths.

## Non-goals

- Becoming a metrics or tracing library. Use OpenTelemetry for that.
- Supporting the browser as a primary target (a compatible build is fine).
- Re-implementing pino's transport worker threads.

## How to influence this roadmap

Open a [discussion](https://github.com/Cryptoteep/logease/discussions) with
your use case. Concrete proposals (with a sketch of the API and a benchmark)
move fastest.

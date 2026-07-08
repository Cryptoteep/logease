# Changelog

All notable changes to **logease** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Public roadmap in `docs/ROADMAP.md`.

## [0.1.0] — 2025-01-15

### Added
- 🎉 Initial public release.
- Core `Logger` with `trace`/`debug`/`info`/`warn`/`error`/`fatal` levels and
  level filtering via `LOGEASE_LEVEL`.
- Child loggers with inherited context & transports (`logger.child({...})`).
- Structured logging: per-call fields and bound context, inlined as `key=value`.
- Three built-in formatters:
  - `PrettyFormatter` — colorful, human-readable, auto color detection.
  - `JsonFormatter` — NDJSON for log shippers.
  - `MinimalFormatter` — `LEVEL message` for compact CLI output.
- Three built-in transports:
  - `ConsoleTransport` — routes to stdout/stderr by severity.
  - `StreamTransport` — generic `WritableStream` sink.
  - `FileTransport` — file output with size-based rotation.
- Per-transport formatters (enables hybrid setups: pretty console + JSON file).
- Timing helpers: `logger.time()` / `logger.timeEnd()` / `logger.measure()`.
- Standalone `Timer` & `TimerRegistry` utilities.
- Zero-dependency ANSI color system with `FORCE_COLOR` / `NO_COLOR` support.
- Default ready-to-use logger exported as `log`.
- Convenience factories: `createJsonLogger()`, `createHybridLogger()`.
- Runnable examples in `examples/`.
- GitHub Actions CI on Node 18/20/22, issue templates, PR template.
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`.

### Security
- Zero runtime dependencies (auditable, no supply-chain risk).
- Loggers never throw — transport failures are swallowed.

[Unreleased]: https://github.com/Cryptoteep/logease/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Cryptoteep/logease/releases/tag/v0.1.0

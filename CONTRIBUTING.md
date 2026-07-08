# Contributing to logease

First of all — thank you for taking the time to contribute! 🎉

logease is a community project. Every issue triaged, bug fixed, transport
written, or doc improved makes the library better for everyone. This document
explains how to get started and what we expect from contributions.

## The project's mission

logease exists to give Node.js & TypeScript developers a logging library that is:

- **tiny** — a few KB, no runtime dependencies, no supply-chain risk;
- **beautiful** — readable, colorful output out of the box;
- **structured** — first-class context, child loggers, and JSON output;
- **extensible** — easy to write your own transports & formatters;
- **honest** — well-typed, well-documented, and never crashes your app.

When proposing changes, please weigh them against these goals. Features that
require adding a runtime dependency, that bloat the hot path, or that reduce
clarity should be discussed in an issue first.

## Code of Conduct

By participating you agree to abide by the [Code of Conduct](./CODE_OF_CONDUCT.md).
Be kind. Be patient. Assume good intent.

## Getting started

You'll need:

- [Node.js](https://nodejs.org/) ≥ 18 (we test on 18, 20, 22)
- [Bun](https://bun.sh/) (used as the dev task runner) — optional but recommended

```bash
git clone https://github.com/Cryptoteep/logease.git
cd logease
bun install            # or: npm install
bun run typecheck      # tsc --noEmit
bun run build          # tsup -> dist/
```

Run an example against the source:

```bash
bun run --bun examples/basic.ts        # with bun
# or
npx tsx examples/basic.ts              # with node + tsx
```

## Project layout

```
src/
  types.ts              public type definitions
  colors.ts             zero-dep ANSI colors + auto-detection
  timer.ts              timing utilities
  core/
    levels.ts           level definitions & ordering
    logger.ts           the Logger class
  formatters/
    pretty.ts           colorful human-readable formatter
    json.ts             NDJSON formatter
    minimal.ts          bare-bones formatter
  transports/
    console.ts          stdout/stderr transport
    stream.ts           generic writable stream transport
    file.ts             file transport w/ size-based rotation
examples/               runnable usage examples
docs/                   long-form docs
```

## How to propose changes

### Reporting a bug

Open a [bug report](https://github.com/Cryptoteep/logease/issues/new?template=bug_report.md).
Include the logease version, Node version, OS, and terminal, plus a minimal
reproduction. Logs are hard to debug without a repro.

### Suggesting a feature

Open a [feature request](https://github.com/Cryptoteep/logease/issues/new?template=feature_request.md)
and explain the problem before the solution. Features that keep logease
zero-dependency and optional are much more likely to land.

### Opening a pull request

1. Fork & branch from `main`.
2. Make your change with focused commits.
3. Ensure `bun run typecheck` and `bun run build` pass.
4. Make sure **no runtime dependencies were added** to `package.json`.
5. Update the README and CHANGELOG for user-visible changes.
6. Reference any related issue (`Closes #123`).

Small, focused PRs are reviewed faster than large ones. If you're planning a
big change, open an issue or draft PR first so we can align on the approach.

## Conventions

- **TypeScript everywhere**, strict mode. Prefer explicit types on public APIs.
- **Zero runtime dependencies** is a hard constraint. Dev dependencies (tsup,
  tsx, typescript) are fine.
- **Errors must never escape a logger call.** Transports swallow write errors;
  formatters have fallbacks.
- **No `any`** in public types. Use `unknown` + narrowing.
- **ESM first** (`"type": "module"`), with a CJS build emitted for compatibility.
- **Commit messages** — write a clear subject line. Conventional Commits
  (`feat:`, `fix:`, `docs:`, `chore:`) are appreciated but not enforced.

## Adding a transport

A transport is anything implementing the `Transport` interface:

```ts
import type { Transport, LogRecord, Formatter } from 'logease';

export class HttpTransport implements Transport {
  readonly name = 'http';
  level?: LogLevel;
  formatter?: Formatter;
  write(record: LogRecord, formatted: string) {
    // ship `formatted` (or `record`) somewhere
  }
  flush() { /* drain buffers */ }
  close() { /* teardown */ }
}
```

Drop it in `src/transports/`, export it from `src/index.ts`, add an example in
`examples/`, and document it in the README. Done.

## Adding a formatter

Formatters implement `Formatter`:

```ts
export class CsvFormatter implements Formatter {
  format(record: LogRecord): string {
    return [record.timestamp, record.level, record.message].join(',');
  }
}
```

Same drill: `src/formatters/`, export, example, docs.

## Releases

Releases are cut from `main` by maintainers, following semantic versioning:

- **patch** — bug fixes, no behavior change
- **minor** — new features, backwards compatible
- **major** — breaking changes (rare; preceded by a deprecation cycle)

The `CHANGELOG.md` is the source of truth for what shipped in each version.

## Need help?

Open a [discussion](https://github.com/Cryptoteep/logease/discussions) or an
issue with the `question` label. We're happy to help.

Happy hacking! 💚

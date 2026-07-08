<div align="center">

# logease

**Beautiful, zero-dependency structured logging for Node.js & TypeScript.**

Tiny · Colorful · Typed · Extensible

[![CI](https://img.shields.io/github/actions/workflow/status/Cryptoteep/logease/ci.yml?branch=main&label=CI&logo=github)](https://github.com/Cryptoteep/logease/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![npm version](https://img.shields.io/badge/npm-0.1.0-red.svg?logo=npm)](https://www.npmjs.com/package/logease)
[![Node](https://img.shields.io/badge/node-%3E%3D18-339933.svg?logo=node.js)](https://nodejs.org)
[![Zero deps](https://img.shields.io/badge/dependencies-0-success.svg)](#why-logease)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg?logo=typescript)](./tsconfig.json)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![Code of Conduct](https://img.shields.io/badge/CoC-Contributor%20Covenant-ff69b4.svg)](./CODE_OF_CONDUCT.md)

</div>

---

> Logging that doesn't suck. **Zero deps. Tiny. Beautiful.**
> logease is a tiny, fast, fully-typed logging library for Node.js. It gives
> you colorful human output in development, structured JSON in production,
> child loggers with context, file rotation, and a plugin model for your own
> transports & formatters — all with **no runtime dependencies**.

```ts
import { log } from 'logease';

log.info('server listening', { port: 3000 });
log.warn('slow query', { table: 'orders', ms: 812 });
log.error(new Error('db connection refused'), { requestId: 'req_42' });
```

```
14:02:09.221  INFO app server listening port=3000
14:02:09.340  WARN app slow query table=orders ms=812
14:02:09.341 ERROR app db connection refused requestId=req_42
  ┌─ Error: db connection refused
  │     at connect (/srv/app/db.ts:42:9)
  │     at Object.<anonymous> (/srv/app/index.ts:8:1)
  └─
```

---

## ✨ Features

- 🪶 **Zero dependencies** — no supply-chain risk, tiny install, fully auditable.
- 🎨 **Beautiful by default** — colorful, aligned, auto-detected terminal support (`FORCE_COLOR` / `NO_COLOR` aware).
- 🏷️ **Structured** — per-call fields and child-logger context, inlined as `key=value` or emitted as JSON.
- 🧬 **Child loggers** — inherit transports & context, perfect for request-scoped logging.
- 📦 **Multiple transports** — console (stdout/stderr split), file with **size-based rotation**, generic stream.
- 🧩 **Pluggable formatters** — pretty, JSON, minimal, or write your own. **Per-transport formatters** enable hybrid setups (pretty console + JSON file).
- ⏱️ **Timing built in** — `time()` / `timeEnd()` / `measure()`.
- 🔒 **TypeScript-first** — strict types, full inference, no `any` in the public API.
- 🛡️ **Never crashes your app** — transport failures are swallowed, formatters have fallbacks.
- 🌳 **Tree-shakeable** ESM build, with a CJS build for compatibility.

## 📦 Install

```bash
npm install logease
# or
bun add logease
# or
pnpm add logease
```

> Requires Node.js ≥ 18.

## 🚀 Quick start

```ts
import { log } from 'logease';

log.trace('very noisy');       // hidden by default (level = info)
log.debug('also hidden');      // hidden by default
log.info('hello, world');
log.warn('something looks off');
log.error('something broke', { requestId: 'req_42' });

// Errors render with a tidy stack frame box
log.error(new Error('boom: database connection refused'));

// Structured fields are inlined as `key=value`
log.info('user signed in', { userId: 7, plan: 'pro', ok: true });
```

Bump verbosity at runtime — no code changes:

```bash
LOGEASE_LEVEL=debug node app.js
```

## 🧬 Child loggers & context

```ts
import { Logger } from 'logease';

const root = new Logger({ name: 'api', level: 'debug' });
const auth = root.child({ module: 'auth' }, 'auth');
const db   = root.child({ module: 'db' },   'db');

auth.info('token verified', { userId: 42 });
// 14:02:10.001  INFO auth token verified module=auth userId=42

db.debug('query plan', { table: 'users', ms: 1.3 });
// 14:02:10.010 DEBUG db   query plan module=db table=users ms=1.3
```

## 🏭 Production: structured JSON

```ts
import { createJsonLogger } from 'logease';

const log = createJsonLogger('billing', 'info');
log.info('invoice generated', { invoiceId: 'inv_8821', amount: 4900 });
```

```jsonc
{"level":"info","msg":"invoice generated","time":"2025-01-15T14:02:10.001Z","name":"billing","invoiceId":"inv_8821","amount":4900}
```

## 💾 Hybrid: pretty console + JSON file with rotation

```ts
import {
  Logger, ConsoleTransport, FileTransport, JsonFormatter,
} from 'logease';

const log = new Logger({
  name: 'worker',
  level: 'info',
  transports: [
    new ConsoleTransport(),                                   // pretty, colorful
    new FileTransport({                                       // NDJSON to disk
      path: './logs/worker.log',
      maxSize: 1024 * 1024,                                   // rotate at 1 MiB
      maxFiles: 3,                                            // keep 3 archives
      formatter: new JsonFormatter(),
    }),
  ],
});
```

## ⏱️ Timing

```ts
log.time('fetch');
await fetch(url);
log.timeEnd('fetch');                  // emits: INFO fetch 203ms

const rows = await log.measure('load-users', async () => {
  return await db.users.findMany();
});                                    // emits: DEBUG load-users 51ms
```

## 🧩 Writing your own transport

```ts
import type { Transport, LogRecord, Formatter } from 'logease';

class HttpTransport implements Transport {
  readonly name = 'http';
  formatter?: Formatter;
  constructor(private url: string, public level?: LogLevel) {}
  write(record: LogRecord, formatted: string) {
    fetch(this.url, { method: 'POST', body: formatted }).catch(() => {});
  }
}

new Logger({ transports: [new HttpTransport('https://log.example/ingest')] });
```

## ⚙️ Configuration

| Option            | Type                                   | Default     | Description                              |
| ----------------- | -------------------------------------- | ----------- | ---------------------------------------- |
| `level`           | `LogLevel`                             | `'info'`    | Minimum severity to emit.                |
| `name`            | `string`                               | `'app'`     | Logger namespace shown in output.        |
| `transports`      | `Transport[]`                          | `[console]` | Where records go.                        |
| `formatter`       | `Formatter`                            | `pretty`    | How records are serialized.              |
| `context`         | `Record<string, unknown>`              | `{}`        | Base context for child loggers.          |
| `color`           | `boolean`                              | `auto`      | Force-disable color with `false`.        |

### Environment variables

| Variable         | Effect                                                       |
| ---------------- | ------------------------------------------------------------ |
| `LOGEASE_LEVEL`  | Sets the default logger's level (`trace`..`fatal`).         |
| `FORCE_COLOR`    | `0`/`1`/`2`/`3` — force a color level.                       |
| `NO_COLOR`       | Any value disables color ([no-color.org](https://no-color.org)). |
| `CI`             | When set without a TTY, color is disabled.                  |

## 📚 API at a glance

```ts
class Logger {
  level: LogLevel;
  name: string;
  context: Record<string, unknown>;
  transports: Transport[];
  formatter: Formatter;

  trace(...args: LogArg[]): void;
  debug(...args: LogArg[]): void;
  info(...args: LogArg[]): void;
  warn(...args: LogArg[]): void;
  error(...args: LogArg[]): void;
  fatal(...args: LogArg[]): void;

  child(bindings?: Record<string, unknown>, name?: string): Logger;
  isLevelEnabled(level: LogLevel): boolean;
  log(record: LogRecord): void;

  time(label: string): void;
  timeEnd(label: string, level?: LogLevel): void;
  measure<T>(label: string, fn: () => Promise<T>): Promise<T>;

  flush(): void;
  close(): void;
}
```

See the [examples](./examples) folder for runnable demos and the
[TypeScript definitions](./src/types.ts) for the full contract.

## 🤔 Why logease?

Node.js already has great loggers. So why another one?

|                  | logease            | pino           | winston        | consola        |
| ---------------- | ------------------ | -------------- | -------------- | -------------- |
| Runtime deps     | **0**              | ~6             | ~10            | 2              |
| Install size     | tiny               | small          | large          | small          |
| Pretty output    | built-in           | via `pino-pretty` | plugin       | built-in       |
| JSON output      | built-in           | default        | built-in       | —              |
| Child loggers    | ✅                  | ✅              | ✅              | —              |
| File rotation    | built-in           | via `rotating-file` | via `winston-daily-rotate-file` | — |
| TS types         | strict, first-class| third-party    | bundled        | bundled        |
| Extensible       | transports/formatters | transports  | transports     | reporters      |

logease isn't trying to replace pino for raw throughput or winston for plugin
breadth. It aims to be the **boringly-correct default** for apps that want
beautiful output in dev, structured logs in prod, zero supply-chain risk, and
an API you can teach in 30 seconds.

**When to reach for something else:**

- You need maximum throughput (millions of logs/sec) → **pino**.
- You need a huge ecosystem of transports (MongoDB, Redis, syslog, …) → **winston**.
- You want a batteries-included CLI reporter → **consola**.

**When to reach for logease:**

- You want zero dependencies and a tiny install.
- You want pretty + JSON from the same logger.
- You value strict TypeScript types and a small, predictable API.

## 🗺️ Roadmap

- [ ] Field redaction (secrets, PII) — `redact: ['password', 'token']`
- [ ] Transport: daily-rotating file
- [ ] Transport: HTTP batching with backoff
- [ ] Formatter: logfmt
- [ ] Browser build (smaller color set, `console` transport)
- [ ] Bun & Deno smoke tests in CI
- [ ] Benchmarks vs pino/winston in `bench/`

Have an idea? Open a [feature request](https://github.com/Cryptoteep/logease/issues/new?template=feature_request.md).

## 🤝 Contributing

Contributions are welcome and appreciated! See [CONTRIBUTING.md](./CONTRIBUTING.md)
to get started, and please read our [Code of Conduct](./CODE_OF_CONDUCT.md).

Good first issues are labeled [`good first issue`](https://github.com/Cryptoteep/logease/labels/good%20first%20issue).

## 📄 License

[MIT](./LICENSE) © Cryptoteep and the logease contributors.

---

<div align="center">

Made with 💚 for the Node.js community.

If logease saves you time, consider ⭐ starring the repo — it helps others find it.

</div>

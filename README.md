# logease

A lightweight, zero-dependency structured logging library for Node.js and the browser.

## Features

- Structured JSON output with configurable levels (trace, debug, info, warn, error)
- Tiny footprint (~2 KB gzipped), no runtime dependencies
- Pluggable transports (console, file, HTTP) via a simple middleware API
- Child loggers with bound context for request-scoped tracing
- Works in Node.js >= 18 and evergreen browsers

## Install

```bash
npm install logease
```

## Quick start

```ts
import { createLogger } from 'logease';

const log = createLogger({ level: 'info' });
log.info('server started', { port: 3000 });
```

## License

MIT © Cryptoteep
/**
 * logease — a tiny micro-benchmark, not a claim of supremacy.
 *
 * Run with: `bun run bench` (or `npx tsx bench/bench.ts`)
 *
 * Measures sustained throughput of `log.info(...)` with the JSON formatter
 * writing to a black-hole stream, so we measure formatting + dispatch
 * rather than I/O. Compare against `console.log` for a rough sanity check.
 */
import { Writable } from 'node:stream';
import { Logger, JsonFormatter, ConsoleTransport } from '../src/index.js';

const blackhole = new Writable({
  write(_chunk, _enc, cb) {
    cb();
  },
});

function bench(name: string, fn: () => void, iterations: number): void {
  // warmup
  for (let i = 0; i < Math.min(iterations, 1000); i++) fn();
  const start = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) fn();
  const ns = Number(process.hrtime.bigint() - start);
  const perOp = ns / iterations;
  const opsPerSec = 1e9 / perOp;
  console.log(
    `${name.padEnd(28)} ${iterations.toLocaleString().padStart(10)} ops  ` +
      `${perOp.toFixed(0).padStart(6)} ns/op  ` +
      `${opsPerSec.toLocaleString(undefined, { maximumFractionDigits: 0 }).padStart(12)} ops/s`,
  );
}

const N = 100_000;

const logger = new Logger({
  name: 'bench',
  level: 'info',
  formatter: new JsonFormatter(),
  transports: [new ConsoleTransport({ stdout: blackhole as unknown as NodeJS.WritableStream })],
});

bench('logease json info(str)', () => logger.info('hello'), N);
bench('logease json info(str,obj)', () => logger.info('hello', { a: 1, b: 'x' }), N);
bench('logease json child.info', () => logger.child({ m: 'x' }).info('hi'), N / 10);

console.log('\n(done — numbers are local, not comparable across machines)');

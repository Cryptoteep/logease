// Timing helpers: time/timeEnd and measure().
import { Logger } from '../src/index.js';

const log = new Logger({ name: 'job', level: 'debug' });

log.time('fetch');
setTimeout(() => {
  log.timeEnd('fetch'); // emits: DEBUG fetch 203ms (approx)

  run().catch((err) => log.error('job failed', err));
}, 200);

async function run() {
  const rows = await log.measure('load-users', async () => {
    await new Promise((r) => setTimeout(r, 50));
    return [{ id: 1 }, { id: 2 }];
  });
  log.info('loaded', { count: rows.length });
}

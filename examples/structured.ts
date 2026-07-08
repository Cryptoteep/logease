// Structured logging for production: ND-JSON to stdout.
import { createJsonLogger } from '../src/index.js';

const log = createJsonLogger('billing', 'info');

log.info('invoice generated', {
  invoiceId: 'inv_8821',
  customerId: 'cus_3',
  amount: 4900,
  currency: 'usd',
  items: 3,
});

log.warn('retrying webhook', { attempt: 2, url: 'https://hooks.example/inv' });

try {
  throw new Error('upstream timeout');
} catch (err) {
  log.error('webhook delivery failed', err, { invoiceId: 'inv_8821' });
}

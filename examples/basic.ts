// Basic usage — the 30-second tour.
import { log } from '../src/index.js';

log.trace('very noisy'); // hidden by default (level=info)
log.debug('also hidden by default');
log.info('hello, world');
log.warn('something looks off');
log.error('something broke', { requestId: 'req_42' });

// Errors are rendered with a tidy stack frame box.
log.error(new Error('boom: database connection refused'));

// Structured fields are inlined as `key=value`.
log.info('user signed in', { userId: 7, plan: 'pro', ok: true });

// Set verbosity via env at runtime: LOGEASE_LEVEL=debug

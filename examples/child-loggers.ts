// Child loggers inherit context & transports from their parent.
import { Logger } from '../src/index.js';

const root = new Logger({ name: 'api', level: 'debug' });

const auth = root.child({ module: 'auth' }, 'auth');
const db = root.child({ module: 'db' }, 'db');

auth.info('token verified', { userId: 42 });
db.debug('query plan', { table: 'users', ms: 1.3 });
db.warn('slow query', { table: 'orders', ms: 812 });

// Children can be nested further.
const tx = db.child({ tx: '9f3a' }, 'db:tx');
tx.info('begin');
tx.info('commit');

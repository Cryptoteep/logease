// Pretty console + JSON file, with rotation.
import { Logger, ConsoleTransport, FileTransport, JsonFormatter } from '../src/index.js';

const logger = new Logger({
  name: 'worker',
  level: 'info',
  transports: [
    // pretty, colorful, human-readable
    new ConsoleTransport(),
    // machine-readable NDJSON to disk, rotated at 1 MiB, keep 3 archives
    new FileTransport({
      path: './logs/worker.log',
      maxSize: 1024 * 1024,
      maxFiles: 3,
      formatter: new JsonFormatter(),
    }),
  ],
});

for (let i = 0; i < 5000; i++) {
  logger.info('processing batch', { i, size: 128 });
}

logger.info('done');
logger.flush();

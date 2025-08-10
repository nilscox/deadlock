import 'dotenv/config';

import { container } from './container.ts';
import { TOKENS } from './tokens.ts';

async function main() {
  const logger = container.resolve(TOKENS.logger);
  const server = container.resolve(TOKENS.server);

  const handleSignal: NodeJS.SignalsListener = (signal) => {
    logger.info(`Received signal ${signal}`);
    void server.close();
  };

  process.addListener('SIGINT', handleSignal);
  process.addListener('SIGTERM', handleSignal);

  await server.start();
}

main().catch(console.error);

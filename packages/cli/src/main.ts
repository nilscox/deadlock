import { createOrm } from '@deadlock/persistence';
import { program, InvalidArgumentError } from 'commander';

import { generate } from './generate';
import { getOrm, setOrm } from './global';
import { Level } from '@deadlock/game';
import { info } from './info';

main().catch(console.error);

program
  .name('Deadlock CLI')
  .description('Toolbox for the game deadlock')
  .configureHelp({ showGlobalOptions: true })
  .showHelpAfterError();

program.option('--clear', 'clear the database before execution').hook('preAction', async () => {
  if (program.opts().clear) {
    await clearDatabase();
  }
});

program
  .command('generate')
  .description('Generate levels')
  .argument('<width>', 'width of the levels to generate', parseInt)
  .argument('<height>', 'height of the levels to generate', parseInt)
  .argument('<blocks>', 'number of blocks per level', parseInt)
  .option('-l --limit <number>', 'maximum number of levels to generate', parseInt)
  .option('-m --max-solutions <number>', 'maximum number of solutions per level', parseInt)
  .option('-r --random', 'generate random levels')
  .option('-s --start <hash>', 'start at a given level hash')
  .action(async (width, height, blocks, args) => {
    await generate({
      width: width,
      height: height,
      blocks: blocks,
      limit: args.limit,
      maxSolutions: args.maxSolutions,
      startHash: args.start,
      random: args.random,
    });
  });

program
  .command('info')
  .description('Print information about a level')
  .argument('<input>', 'level definition or hash')
  .action(async (input) => {
    let level: Level;

    try {
      level = new Level(JSON.parse(input));
    } catch {
      level = Level.fromHash(input);
    }

    info(level);
  });

async function main() {
  const orm = await createOrm('../../db.sqlite');

  setOrm(orm, orm.em.fork());

  try {
    await program.parseAsync();
  } finally {
    await orm.close(true);
  }
}

async function clearDatabase() {
  const orm = getOrm();
  const schemaGenerator = orm.getSchemaGenerator();

  await schemaGenerator.clearDatabase();
  await orm.em.fork().execute('vacuum');
}

function parseInt(value: string) {
  const parsed = Number.parseInt(value);

  if (Number.isNaN(parsed)) {
    throw new InvalidArgumentError('Not a number.');
  }

  return parsed;
}

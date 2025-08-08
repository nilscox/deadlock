import { Level, LevelDefinition } from '@deadlock/game';
import { createOrm } from '@deadlock/persistence';
import { InvalidArgumentError, program } from 'commander';

import { create } from './create';
import { generate } from './generate';
import { getOrm, setOrm } from './global';
import { info } from './info';
import { recomputeDifficulties } from './recompute-difficulties';

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
  .command('recompute-difficulties')
  .description('Recompute evaluated difficulties of every level')
  .action(recomputeDifficulties);

interface GenerateOptions {
  difficulty: number;
  maxSolutions: number;
  teleports: boolean;
}

program
  .command('generate')
  .description('Generate random levels')
  .argument('<count>', 'number of levels to generate', parseInt)
  .argument('<width>', 'width of the levels to generate', parseInt)
  .argument('<height>', 'height of the levels to generate', parseInt)
  .argument('<blocks>', 'number of blocks per level', parseInt)
  .option('-d --difficulty <number>', 'minimum difficulty', parseInt)
  .option('-m --max-solutions <number>', 'maximum number of solutions per level', parseInt)
  .option('-t --teleports', 'generate with teleports', parseInt)
  .action(async (count: number, width: number, height: number, blocks: number, options: GenerateOptions) => {
    await generate({
      count,
      width,
      height,
      nbBlocks: blocks,
      maxSolutions: options.maxSolutions,
      minDifficulty: options.difficulty,
      teleports: options.teleports,
    });
  });

program
  .command('save')
  .description('Save a new level to the database')
  .argument('<input>', 'level definition or hash', parseDefinitionOrHash)
  .action(create);

program
  .command('info')
  .description('Print information about a level')
  .argument('<input>', 'level definition or hash')
  .action(info);

async function main() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const orm = await createOrm(process.env.DB_URL!, process.env.DB_SSL === 'true', false);

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

function parseDefinitionOrHash(input: string) {
  try {
    return Level.load(JSON.parse(input) as LevelDefinition);
  } catch {
    return Level.load(input);
  }
}

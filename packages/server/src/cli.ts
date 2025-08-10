import 'dotenv/config';

import assert from 'node:assert';

import { Level, type LevelDefinition, Point, generateLevel } from '@deadlock/game';
import { InvalidArgumentError, program } from 'commander';

import { container } from './container.ts';
import { levels, sessions } from './schema.ts';
import { MUTATIONS, TOKENS } from './tokens.ts';

program
  .name('Deadlock CLI')
  .description('Toolbox for the game deadlock')
  .configureHelp({ showGlobalOptions: true })
  .showHelpAfterError();

program.hook('preAction', async (command, action) => {
  action.processedArgs = await Promise.all(action.processedArgs);
});

program.hook('postAction', async () => container.resolve(TOKENS.database).close());

program.option('--clear', 'clear the database before execution').hook('preAction', async () => {
  if (program.opts().clear) {
    const db = container.resolve(TOKENS.database);
    const config = container.resolve(TOKENS.config);

    assert(config.database.url.includes('localhost'), 'Database URL does not include "localhost"');

    await db.delete(sessions);
    await db.delete(levels);
  }
});

program
  .command('info')
  .description('Print information about a level')
  .argument('<level>', 'level id, definition or hash', parseLevelInput)
  .action((level: Level) => {
    console.log(level);

    console.log();
    console.log('Width: ', level.definition.width);
    console.log('Height:', level.definition.height);
    console.log('Start: ', new Point(level.definition.start));
    console.log('Blocks:', level.definition.blocks.map((block) => new Point(block)).join(', '));

    console.log();
    console.log('Hash:        ', level.hash);
    console.log('Fingerprint: ', level.fingerprint);
    console.log('Natural form:', level.hash === level.fingerprint);
  });

program
  .command('create')
  .description('Save a new level to the database')
  .argument('<input>', 'level definition or hash', parseLevelInput)
  .action(async (level: Level) => {
    const mutation = container.resolve(MUTATIONS.createLevel);

    await mutation.execute({
      definition: level.definition,
    });
  });

program
  .command('recompute-difficulties')
  .description('Recompute evaluated difficulties of all levels')
  .action(async () => {
    const mutation = container.resolve(MUTATIONS.recomputeDifficulties);
    await mutation.execute();
  });

interface GenerateOptions {
  minDifficulty: number;
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
  .option('-d --min-difficulty <number>', 'minimum difficulty', parseInt)
  .option('-s --max-solutions <number>', 'maximum number of solutions per level', parseInt)
  .option('-t --teleports', 'generate with teleports')
  .action(async (count: number, width: number, height: number, blocks: number, options: GenerateOptions) => {
    const logger = container.resolve(TOKENS.logger);
    const mutation = container.resolve(MUTATIONS.createLevel);

    logger.info(`Generating ${String(count)} level`);

    for (let i = 0; i < count; ++i) {
      const definition = generateLevel({
        width,
        height,
        nbBlocks: blocks,
        ...options,
      });

      await mutation.execute({ definition });

      logger.info(`${String(i + 1)}/${String(count)} level generated`);
    }
  });

program.parseAsync().catch(console.error);

function parseInt(value: string) {
  const parsed = Number.parseInt(value);

  if (Number.isNaN(parsed)) {
    throw new InvalidArgumentError('Not a number.');
  }

  return parsed;
}

async function parseLevelInput(input: string) {
  const db = container.resolve(TOKENS.database);

  const level = await db.query.levels.findFirst({
    where: (level, { eq }) => eq(level.id, input),
  });

  if (level) {
    return Level.load(level);
  }

  try {
    return Level.load(JSON.parse(input) as LevelDefinition);
  } catch {
    return Level.load(input);
  }
}

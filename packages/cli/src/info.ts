import { Level, Point } from '@deadlock/game';

export const info = (level: Level) => {
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
};

import { LevelDefinition } from '@deadlock/game';
import { Meta, StoryFn } from '@storybook/react';

import { Game } from './game';

type Args = {
  definition: LevelDefinition;
};

const definition = {
  width: 5,
  height: 3,
  blocks: [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
    { x: 3, y: 2 },
  ],
  start: { x: 2, y: 1 },
  teleports: [],
};

export default {
  title: 'Game',
  args: {
    definition,
  },
} satisfies Meta<Args>;

export const game: StoryFn<Args> = (args) => {
  return <Game {...args} />;
};

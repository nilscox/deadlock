import { LevelDefinition } from '@deadlock/game';
import { Meta, StoryFn } from '@storybook/react';
import { useState } from 'react';

import { LevelEditor } from './level-editor';

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
  title: 'LevelEditor',
  args: {
    definition,
  },
} satisfies Meta<Args>;

export const levelEditor: StoryFn<Args> = ({ definition }) => {
  const [def, setDef] = useState(definition);
  return <LevelEditor definition={def} onChange={setDef} />;
};

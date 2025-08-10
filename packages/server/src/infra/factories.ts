import type { levels, sessions } from '../schema.ts';

import { NanoIdGeneratorAdapter } from './generator.ts';

function factory<T>(getDefaults: () => T) {
  return (values?: Partial<T>) => ({ ...getDefaults(), ...values });
}

const generator = new NanoIdGeneratorAdapter();

export const create = {
  level: factory<typeof levels.$inferInsert>(() => ({
    id: generator.id(),
    width: 0,
    height: 0,
    blocks: [],
    start: { x: 0, y: 0 },
    teleports: [],
    fingerprint: '',
    position: 0,
    difficulty: 0,
  })),

  session: factory<typeof sessions.$inferInsert>(() => ({
    id: generator.id(),
    levelId: '',
    completed: false,
    time: 0,
    tries: 0,
    date: new Date(0),
    ip: '',
  })),
};

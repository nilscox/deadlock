import assert from 'node:assert';
import test, { suite } from 'node:test';

import { ReflectionTransform, RotationTransform } from './level-transforms.ts';
import type { LevelDefinition } from './level.ts';

await suite('LevelTransforms', async () => {
  const def: LevelDefinition = {
    width: 3,
    height: 2,
    start: { x: 0, y: 0 },
    blocks: [],
    teleports: [],
  };

  await test('horizontal reflection', () => {
    assert.deepStrictEqual(ReflectionTransform.horizontal(def), {
      width: 3,
      height: 2,
      start: { x: 2, y: 0 },
      blocks: [],
      teleports: [],
    });
  });

  await test('vertical reflection', () => {
    assert.deepStrictEqual(ReflectionTransform.vertical(def), {
      width: 3,
      height: 2,
      start: { x: 0, y: 1 },
      blocks: [],
      teleports: [],
    });
  });

  await test('quarter rotation', () => {
    assert.deepStrictEqual(RotationTransform.quarter(def), {
      width: 2,
      height: 3,
      start: { x: 0, y: 2 },
      blocks: [],
      teleports: [],
    });
  });

  await test('half rotation', () => {
    assert.deepStrictEqual(RotationTransform.half(def), {
      width: 3,
      height: 2,
      start: { x: 2, y: 1 },
      blocks: [],
      teleports: [],
    });
  });

  await test('three quarters rotation', () => {
    assert.deepStrictEqual(RotationTransform.threeQuarters(def), {
      width: 2,
      height: 3,
      start: { x: 1, y: 0 },
      blocks: [],
      teleports: [],
    });
  });
});

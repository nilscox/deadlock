import { describe, expect, it } from 'vitest';

import { LevelDefinition } from './level';
import { ReflectionTransform, RotationTransform } from './level-transforms';

describe('LevelTransforms', () => {
  const def: LevelDefinition = {
    width: 3,
    height: 2,
    start: { x: 0, y: 0 },
    blocks: [],
    teleports: [],
  };

  it('horizontal reflection', () => {
    expect(ReflectionTransform.horizontal(def)).toEqual({
      width: 3,
      height: 2,
      start: { x: 2, y: 0 },
      blocks: [],
      teleports: [],
    });
  });

  it('vertical reflection', () => {
    expect(ReflectionTransform.vertical(def)).toEqual({
      width: 3,
      height: 2,
      start: { x: 0, y: 1 },
      blocks: [],
      teleports: [],
    });
  });

  it('quarter rotation', () => {
    expect(RotationTransform.quarter(def)).toEqual({
      width: 2,
      height: 3,
      start: { x: 0, y: 2 },
      blocks: [],
      teleports: [],
    });
  });

  it('half rotation', () => {
    expect(RotationTransform.half(def)).toEqual({
      width: 3,
      height: 2,
      start: { x: 2, y: 1 },
      blocks: [],
      teleports: [],
    });
  });

  it('three quarters rotation', () => {
    expect(RotationTransform.threeQuarters(def)).toEqual({
      width: 2,
      height: 3,
      start: { x: 1, y: 0 },
      blocks: [],
      teleports: [],
    });
  });
});

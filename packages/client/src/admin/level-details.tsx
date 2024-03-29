import {
  Direction,
  Game as GameClass,
  LevelDefinition,
  getLevelDifficultyDetails,
  solve,
} from '@deadlock/game';
import { Suspense, useEffect, useMemo, useState } from 'react';

import { Game } from '~/game/game';
import { useBoolean } from '~/hooks/use-boolean';

import { LevelRow } from './admin-view';
import { SessionsList } from './sessions-list';

type LevelDetailsProps = {
  level: LevelRow;
};

export const LevelDetails = ({ level }: LevelDetailsProps) => {
  const [controlsEnabled, enableControls, disableControls] = useBoolean(false);
  const score = useMemo(() => getLevelDifficultyDetails(level.definition), [level]);

  return (
    <>
      <div
        className="row justify-center items-center gap-8 mx-auto py-6"
        onMouseOver={enableControls}
        onMouseOut={disableControls}
      >
        <LevelPreview definition={level.definition} enableControls={controlsEnabled} />
        <Solutions definition={level.definition} />
      </div>

      <ul>
        <li>Number of solutions: {score?.numberOfSolutions}</li>
        <li>Number of solutions score: {score?.numberOfSolutionsScore}</li>
        <li>Jumps: {score?.jumps}</li>
        <li>Jumps score: {score?.jumpsScore}</li>
        <li>Opposite: {score?.opposite}</li>
        <li>Opposite score: {score?.oppositeScore}</li>
        <li>Options: {score?.options}</li>
        <li>Options score: {score?.optionsScore}</li>
        <li>Total score: {score?.total}</li>
      </ul>

      <Suspense>
        <SessionsList levelId={level.id} />
      </Suspense>
    </>
  );
};

type LevelPreviewProps = {
  definition: LevelDefinition;
  enableControls: boolean;
};

const LevelPreview = ({ definition, enableControls }: LevelPreviewProps) => {
  const [game, setGame] = useState<GameClass>();

  useEffect(() => {
    if (enableControls) {
      game?.enableControls();
    } else {
      game?.disableControls();
    }
  }, [game, enableControls]);

  return (
    <Game
      styles={{ width: 220, height: 160 }}
      definition={definition}
      onLoaded={(game, renderer) => {
        renderer.scale(0.6);
        game.disableControls();
        setGame(game);
      }}
    />
  );
};

type SolutionsProps = {
  definition: LevelDefinition;
};

const Solutions = ({ definition }: SolutionsProps) => {
  const solutions = useMemo(() => solve(definition), [definition]);

  if (!solutions || solutions.length === 0) {
    return <div className="text-muted">No solution found</div>;
  }

  return (
    <div className="col gap-1 h-full">
      {solutions.slice(0, 3).map((solution, index) => (
        <div key={index} className="row gap-2 items-center">
          {solution.map((direction, index) => (
            <span key={index}>{arrows[direction]}</span>
          ))}
        </div>
      ))}

      {solutions.length > 3 && <div>...</div>}

      <div className="text-muted mt-auto">total: {solutions.length}</div>
    </div>
  );
};

const arrows: Record<Direction, string> = {
  [Direction.up]: '🢁',
  [Direction.down]: '🢃',
  [Direction.left]: '🢀',
  [Direction.right]: '🢂',
};

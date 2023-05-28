import { Direction, Game as GameClass, LevelDefinition, LevelSolutions } from '@deadlock/game';
import { useEffect, useState } from 'react';

import { Game } from '~/game/game';
import { useBoolean } from '~/hooks/use-boolean';

import { LevelRow } from './levels-tab';

type LevelDetailsProps = {
  level: LevelRow;
};

export const LevelDetails = ({ level }: LevelDetailsProps) => {
  const [controlsEnabled, enableControls, disableControls] = useBoolean(false);

  return (
    <div
      className="row justify-center items-center gap-8 mx-auto py-6"
      onMouseOver={enableControls}
      onMouseOut={disableControls}
    >
      <LevelPreview definition={level.definition} enableControls={controlsEnabled} />
      <Solutions solutions={level.solutions} />
    </div>
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
  solutions: LevelSolutions;
};

const Solutions = ({ solutions }: SolutionsProps) => {
  if (!solutions || solutions.total === 0) {
    return <div className="text-muted">No solution found</div>;
  }

  return (
    <div className="col gap-1 h-full">
      {solutions.items.slice(0, 3).map((solution, index) => (
        <div key={index} className="row gap-2 items-center">
          {solution.path.map((direction, index) => (
            <span key={index}>{directions[direction]}</span>
          ))}

          <span className="text-muted text-xs">({solution.complexity})</span>
        </div>
      ))}

      {solutions.total > 3 && <div>...</div>}

      <div className="text-muted mt-auto">total: {solutions.total}</div>
    </div>
  );
};

const directions: Record<Direction, JSX.Element> = {
  [Direction.right]: <div className="">➜</div>,
  [Direction.left]: <div className="flip-horizontal">➜</div>,
  [Direction.up]: <div className="-rotate-90">➜</div>,
  [Direction.down]: <div className="rotate-90">➜</div>,
};

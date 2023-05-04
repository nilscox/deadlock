import { CSSProperties, useCallback, useMemo, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Link } from 'wouter';

import { Direction, Path } from '../game/direction';
import { evaluateLevelDifficulty, evaluateSolutionSimplicity } from '../game/evaluate-difficulty';
import { Game } from '../game/game';
import { levels } from '../game/levels';
import { solve } from '../game/solve';
import { useGame } from '../use-game';

const levelIds = Object.keys(levels);

export const LevelsListView = () => {
  const [wrapperRef, setWrapperRef] = useState<HTMLDivElement | null>(null);
  const [search, setSearch] = useState('');

  const filteredIds = useMemo(() => {
    if (search === '') {
      return levelIds;
    }

    return levelIds.filter((levelId) => levelId.match(search));
  }, [search]);

  return (
    <div ref={setWrapperRef} className="col gap-4 h-full col">
      <input
        type="search"
        placeholder="Search..."
        className="px-2 py-1 m-4 outline-none border rounded"
        onChange={(e) => setSearch(e.target.value)}
      />

      <List
        height={wrapperRef?.clientHeight ?? 0}
        itemCount={filteredIds.length}
        itemSize={180}
        width="100%"
        itemData={{ filteredIds }}
      >
        {Row}
      </List>
    </div>
  );
};

type RowProps = {
  index: number;
  style: CSSProperties;
  data: { filteredIds: string[] };
};

const Row = ({ index, style, data }: RowProps) => (
  <div style={style}>
    <Level levelId={data.filteredIds[index]} levelNumber={index + 1} />
  </div>
);

type LevelProps = {
  levelId: string;
  levelNumber: number;
};

const Level = ({ levelId, levelNumber }: LevelProps) => (
  <div className="row divide-x p-4">
    <div className="px-4">
      <Link href={`/level/${levelId}`} className="row gap-4">
        #{levelNumber} <div className="text-muted">{levelId}</div>
      </Link>
      <LevelPreview levelId={levelId} />
    </div>

    <div className="px-4 min-w-[400px]">
      <Solutions levelId={levelId} />
    </div>

    <div className="px-4">
      <Score levelId={levelId} />
    </div>
  </div>
);

type LeveLPreviewProps = {
  levelId: string;
};

const LevelPreview = ({ levelId }: LeveLPreviewProps) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  useGame(canvas, levelId, {
    scale: 0.4,
    onLoaded: useCallback((game: Game) => {
      game.allowRestartWhenCompleted = true;
    }, []),
  });

  return <canvas ref={setCanvas} style={{ height: 120 }} />;
};

type SolutionsProps = {
  levelId: string;
};

const Solutions = ({ levelId }: SolutionsProps) => {
  const solutions = useMemo(() => {
    const solutions = (solve(levels[levelId]) || []).map(
      (solution) => [solution, evaluateSolutionSimplicity(solution)] as const
    );

    if (solutions) {
      solutions.sort(([, a], [, b]) => a - b);
    }

    return solutions;
  }, [levelId]);

  const copySolutions = () => {
    navigator.clipboard.writeText(stringifySolutions(solutions.map(([solution]) => solution)));
  };

  if (solutions.length === 0) {
    return <div className="text-muted">No solution found</div>;
  }

  return (
    <div className="col gap-2">
      {solutions.slice(0, 4).map(([solution, simplicity], index) => (
        <div key={index} className="row gap-2 items-center">
          {solution.map((direction, index) => (
            <span key={index}>{directions[direction]}</span>
          ))}
          <span className="text-muted text-sm">({simplicity})</span>
        </div>
      ))}

      <div className="text-muted text-sm">
        total: {solutions.length} <button onClick={copySolutions}>(copy)</button>
      </div>
    </div>
  );
};

const stringifySolutions = (solutions: Path[]): string => {
  return solutions.map((solution) => solution.join(' ')).join('\n');
};

const directions: Record<Direction, JSX.Element> = {
  [Direction.right]: <div className="">➜</div>,
  [Direction.left]: <div className="flip-horizontal">➜</div>,
  [Direction.up]: <div className="-rotate-90">➜</div>,
  [Direction.down]: <div className="rotate-90">➜</div>,
};

type ScoreProps = {
  levelId: string;
};

const Score = ({ levelId }: ScoreProps) => {
  const [numberOfSolutionsScore, simplestSolutionScore] = useMemo(
    () => evaluateLevelDifficulty(levels[levelId]),
    [levelId]
  );

  if (numberOfSolutionsScore === -1) {
    return null;
  }

  const difficulty = numberOfSolutionsScore + simplestSolutionScore;

  const r = 255 * Math.min(1, difficulty / 20);
  const g = 255 - r;
  const b = 0;

  return (
    <>
      <div className="font-semibold" style={{ color: `rgb(${r}, ${g}, ${b})` }}>
        Difficulty: {difficulty}
      </div>
      <div className="text-muted text-sm">Number of solutions score: {numberOfSolutionsScore}</div>
      <div className="text-muted text-sm">Simplest solutions score: {simplestSolutionScore}</div>
    </>
  );
};

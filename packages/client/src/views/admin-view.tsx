import {
  Direction,
  Game,
  LevelStats,
  LevelsStats,
  Path,
  evaluateLevelDifficulty,
  round,
  solve,
} from '@deadlock/game';
import { CSSProperties, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { FixedSizeList as List, areEqual } from 'react-window';
import { Link } from 'wouter';

import { useLevel, useLevelInstance, useLevelNumber, useLevelsIds } from '../game/levels-context';
import { useConfig } from '../hooks/use-config';
import { useGame } from '../use-game';
import { copy } from '../utils';

export const AdminView = () => {
  const { serverUrl } = useConfig();

  const levelsIds = useLevelsIds();
  const [stats, setStats] = useState<LevelsStats>();

  useEffect(() => {
    void fetch(`${serverUrl}/stats`)
      .then((res) => res.json())
      .then(setStats);
  }, [serverUrl]);

  const [wrapperRef, setWrapperRef] = useState<HTMLDivElement | null>(null);
  const [search, setSearch] = useState('');

  const filteredIds = useMemo(() => {
    if (search === '') {
      return levelsIds;
    }

    return levelsIds.filter((levelId) => levelId.match(search));
  }, [levelsIds, search]);

  const itemData = useMemo(() => ({ filteredIds, stats }), [filteredIds, stats]);

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
        itemData={itemData}
      >
        {Row}
      </List>
    </div>
  );
};

type RowProps = {
  index: number;
  style: CSSProperties;
  data: { filteredIds: string[]; stats?: LevelsStats };
};

const Row = memo(
  ({ index, style, data }: RowProps) => (
    <div style={style}>
      <LevelRow key={data.filteredIds[index]} levelId={data.filteredIds[index]} stats={data.stats} />
    </div>
  ),
  areEqual
);

type LevelRowProps = {
  levelId: string;
  stats?: LevelsStats;
};

const LevelRow = ({ levelId, stats }: LevelRowProps) => {
  const { definition } = useLevel(levelId);
  const level = useLevelInstance(levelId);
  const levelNumber = useLevelNumber(levelId);

  const solutions = useMemo(() => {
    return solve(definition);
  }, [definition]);

  return (
    <div className="row divide-x p-4">
      <div className="px-4">
        <div className="row gap-2 items-center">
          <Link href={`/level/${levelId}`}>#{levelNumber}</Link>

          <button onClick={() => copy(levelId)} className="text-muted">
            {levelId}
          </button>

          <div className="row gap-2 text-muted text-xs ml-auto">
            <button onClick={() => copy(JSON.stringify(definition))}>JSON</button>
            {' | '}
            <button onClick={() => copy(level.fingerprint)}>FP</button>
          </div>
        </div>

        <LevelPreview levelId={levelId} />
      </div>

      <div className="px-4 min-w-[400px]">
        <Solutions levelId={levelId} solutions={solutions} />
      </div>

      <div className="px-4">
        <Score levelId={levelId} solutions={solutions} />
      </div>

      <div className="px-4">
        <Stats stats={stats?.[levelId]} />
      </div>
    </div>
  );
};

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
  solutions?: Path[];
};

const Solutions = ({ solutions }: SolutionsProps) => {
  const copySolutions = () => {
    if (!solutions) {
      return;
    }

    navigator.clipboard.writeText(solutions.map((solution) => solution.join(' ')).join('\n'));
  };

  if (!solutions || solutions?.length === 0) {
    return <div className="text-muted">No solution found</div>;
  }

  return (
    <div className="col gap-1 h-full">
      {solutions.slice(0, 3).map((solution, index) => (
        <div key={index} className="row gap-2 items-center">
          {solution.map((direction, index) => (
            <span key={index}>{directions[direction]}</span>
          ))}
        </div>
      ))}

      {solutions.length > 3 && <div className="text-sm">...</div>}

      <div className="text-muted text-sm mt-auto">
        total: {solutions.length} <button onClick={copySolutions}>(copy)</button>
      </div>
    </div>
  );
};

const directions: Record<Direction, JSX.Element> = {
  [Direction.right]: <div className="">➜</div>,
  [Direction.left]: <div className="flip-horizontal">➜</div>,
  [Direction.up]: <div className="-rotate-90">➜</div>,
  [Direction.down]: <div className="rotate-90">➜</div>,
};

type ScoreProps = {
  levelId: string;
  solutions?: Path[];
};

const Score = ({ levelId, solutions }: ScoreProps) => {
  const { definition } = useLevel(levelId);

  const { difficulty, numberOfSolutions, numberOfSolutionsScore, easiestSolution } = useMemo(
    () => evaluateLevelDifficulty(definition, solutions),
    [definition, solutions]
  );

  const r = 255 * Math.min(1, difficulty / 20);
  const g = 255 - r;
  const b = 0;

  return (
    <>
      <div className="font-semibold pb-2" style={{ color: `rgb(${r}, ${g}, ${b})` }}>
        Difficulty: {round(difficulty, 3)}
      </div>

      <div className="text-muted text-sm">
        Number of solutions: {numberOfSolutions} ({round(numberOfSolutionsScore ?? 0, 2)})
      </div>

      <div className="text-muted text-sm">Easiest solution: {easiestSolution}</div>
    </>
  );
};

type StatsProps = {
  stats?: LevelStats;
};

const Stats = ({ stats }: StatsProps) => {
  if (!stats) {
    return <div className="text-muted">No stats.</div>;
  }

  return (
    <ul className="text-sm">
      <li>
        Played: <Times value={stats.played} />
      </li>

      <li>
        Completed: <Times value={stats.completed} />
      </li>

      <li>
        Skipped: <Times value={stats.skipped} />
      </li>

      <li>
        Tries: <strong>{stats.tries.mean}</strong> (min: {stats.tries.min}, max: {stats.tries.max})
      </li>

      <li>
        Play time: <strong>{secs(stats.playTime.mean)}</strong> (min: {secs(stats.playTime.min)}, max:{' '}
        {secs(stats.playTime.max)})
      </li>
    </ul>
  );
};

const secs = (time: number) => {
  return Math.floor(time / 1000) + 's';
};

type TimesProps = {
  value: number;
};

const Times = ({ value }: TimesProps) => {
  if (value === 0) {
    return <>-</>;
  }

  return (
    <>
      <strong>{value}</strong> time{value !== 1 && 's'}
    </>
  );
};

import { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Link } from 'wouter';

import { Direction, Path } from '../game/direction';
import { evaluateLevelDifficulty, evaluateSolutionSimplicity } from '../game/evaluate-difficulty';
import { Game } from '../game/game';
import { Level as LevelClass } from '../game/level';
import { levels } from '../game/levels';
import { solve } from '../game/solve';
import { LevelStats, LevelsStats, copy } from '../game/utils';
import { useGame } from '../use-game';
import { getLevelNumber } from '../use-levels';

const serverUrl = import.meta.env.VITE_APP_SERVER_URL;
const levelIds = Object.keys(levels);

export const AdminView = () => {
  const [stats, setStats] = useState<LevelsStats>();

  useEffect(() => {
    void fetch(serverUrl)
      .then((res) => res.json())
      .then(setStats);
  }, []);

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
        itemData={{ filteredIds, stats }}
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

const Row = ({ index, style, data }: RowProps) => (
  <div style={style}>
    <Level levelId={data.filteredIds[index]} stats={data.stats} />
  </div>
);

type LevelProps = {
  levelId: string;
  stats?: LevelsStats;
};

const Level = ({ levelId, stats }: LevelProps) => (
  <div className="row divide-x p-4">
    <div className="px-4">
      <div className="row gap-2 items-center">
        <Link href={`/level/${levelId}`}>#{getLevelNumber(levelId)}</Link>

        <button onClick={() => copy(levelId)} className="text-muted">
          {levelId}
        </button>

        <button
          onClick={() => copy(JSON.stringify(levels[levelId]))}
          className="ml-auto text-muted text-sm font-semibold"
        >
          Copy JSON
        </button>
      </div>

      <LevelPreview levelId={levelId} />
    </div>

    <div className="px-4 min-w-[400px]">
      <Solutions levelId={levelId} />
    </div>

    <div className="px-4">
      <Score levelId={levelId} />
    </div>

    <div className="px-4">
      <Stats stats={stats?.[levelId]} />
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
    const level = new LevelClass(levels[levelId]);

    const solutions = (solve(level) || []).map(
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
    <div className="col gap-1 h-full">
      {solutions.slice(0, 3).map(([solution, simplicity], index) => (
        <div key={index} className="row gap-2 items-center">
          {solution.map((direction, index) => (
            <span key={index}>{directions[direction]}</span>
          ))}
          <span className="text-muted text-sm">({simplicity})</span>
        </div>
      ))}

      {solutions.length > 3 && <div className="text-sm">...</div>}

      <div className="text-muted text-sm mt-auto">
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
    () => evaluateLevelDifficulty(new LevelClass(levels[levelId])),
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
      <div className="font-semibold pb-2" style={{ color: `rgb(${r}, ${g}, ${b})` }}>
        Difficulty: {difficulty}
      </div>
      <div className="text-muted text-sm">Number of solutions score: {numberOfSolutionsScore}</div>
      <div className="text-muted text-sm">Simplest solutions score: {simplestSolutionScore}</div>
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

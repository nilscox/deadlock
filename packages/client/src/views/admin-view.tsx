import {
  Direction,
  LevelSolutions,
  LevelStats,
  LevelsSolutions,
  LevelsStats,
  round,
  Game as GameClass,
} from '@deadlock/game';
import { CSSProperties, memo, useEffect, useMemo, useState } from 'react';
import { FixedSizeList as List, areEqual } from 'react-window';
import { Link } from 'wouter';

import { Game } from '../game/game';
import { useLevel, useLevelInstance, useLevelNumber, useLevelsIds } from '../game/levels-context';
import { useConfig } from '../hooks/use-config';
import { copy } from '../utils';

export const AdminView = () => {
  const { serverUrl } = useConfig();

  const levelsIds = useLevelsIds();

  const [stats, setStats] = useState<LevelsStats>();
  const [solutions, setSolutions] = useState<LevelsSolutions>();

  useEffect(() => {
    void fetch(`${serverUrl}/stats`)
      .then((res) => res.json())
      .then(setStats);

    void fetch(`${serverUrl}/solutions`)
      .then((res) => res.json())
      .then(setSolutions);
  }, [serverUrl]);

  const [wrapperRef, setWrapperRef] = useState<HTMLDivElement | null>(null);
  const [search, setSearch] = useState('');

  const filteredIds = useMemo(() => {
    if (search === '') {
      return levelsIds;
    }

    return levelsIds.filter((levelId) => levelId.match(search));
  }, [levelsIds, search]);

  const itemData = useMemo(
    () => ({
      filteredIds,
      stats,
      solutions,
    }),
    [filteredIds, stats, solutions]
  );

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
  data: {
    filteredIds: string[];
    stats?: LevelsStats;
    solutions?: LevelsSolutions;
  };
};

const Row = memo(({ index, style, data }: RowProps) => {
  const levelId = data.filteredIds[index];

  return (
    <div style={style}>
      <LevelRow key={levelId} levelId={levelId} stats={data.stats} solutions={data.solutions?.[levelId]} />
    </div>
  );
}, areEqual);

Row.displayName = 'Row';

type LevelRowProps = {
  levelId: string;
  stats?: LevelsStats;
  solutions?: LevelSolutions;
};

const LevelRow = ({ levelId, stats, solutions }: LevelRowProps) => {
  const { definition } = useLevel(levelId);
  const level = useLevelInstance(levelId);
  const levelNumber = useLevelNumber(levelId);

  const [enableControls, setEnableControl] = useState(false);

  return (
    <div
      className="row divide-x p-4 hover:bg-muted/50"
      onMouseOver={() => setEnableControl(true)}
      onMouseOut={() => setEnableControl(false)}
    >
      <div className="px-4">
        <div className="row gap-2 items-center">
          <Link href={`/level/${levelId}`}>#{levelNumber}</Link>

          <button onClick={() => copy(levelId)} className="text-muted">
            {levelId}
          </button>

          <div className="row gap-2 text-muted text-xs ml-auto">
            <button onClick={() => copy(JSON.stringify(definition))}>JSON</button>
            <button onClick={() => copy(level.hash)}>hash</button>
            <button onClick={() => copy(level.fingerprint)}>FP</button>
          </div>
        </div>

        <LevelPreview levelId={levelId} enableControls={enableControls} />
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
  enableControls: boolean;
};

const LevelPreview = ({ levelId, enableControls }: LeveLPreviewProps) => {
  const { definition } = useLevel(levelId);
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
      styles={{ width: 220, height: 120 }}
      definition={definition}
      onLoaded={(game, renderer) => {
        renderer.scale(0.4);
        game.disableControls();
        setGame(game);
      }}
    />
  );
};

type SolutionsProps = {
  levelId: string;
  solutions?: LevelSolutions;
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

      {solutions.total > 3 && <div className="text-sm">...</div>}

      <div className="text-muted text-sm mt-auto">total: {solutions.total}</div>
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
  solutions?: LevelSolutions;
};

const Score = ({ solutions }: ScoreProps) => {
  if (!solutions) {
    return null;
  }

  const { difficulty, numberOfSolutionsScore, easiestSolutionScore } = solutions;

  const r = 255 * Math.min(1, difficulty / 20);
  const g = 255 - r;
  const b = 0;

  return (
    <>
      <div className="font-semibold pb-2" style={{ color: `rgb(${r}, ${g}, ${b})` }}>
        Difficulty: {round(difficulty, 3)}
      </div>

      <div className="text-muted text-sm">Number of solutions score: {numberOfSolutionsScore}</div>
      <div className="text-muted text-sm">Easiest solution score: {easiestSolutionScore}</div>
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
  return `${Math.floor(time / 1000)}s`;
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

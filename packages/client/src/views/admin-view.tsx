import {
  assert,
  Direction,
  Game as GameClass,
  identity,
  Level,
  LevelDefinition,
  LevelsSolutions,
  LevelsStats,
  round,
  toObject,
} from '@deadlock/game';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CSSProperties, memo, useEffect, useMemo, useState } from 'react';
import { areEqual, FixedSizeList as List } from 'react-window';
import { Link } from 'wouter';

import { Game } from '../game/game';
import { useLevelNumber, useLevelsIds } from '../game/levels-context';
import { getConfig } from '../hooks/use-config';
import { copy } from '../utils';

// cspell:word unvalidated

export const AdminView = () => {
  const levelsIds = Object.keys(useAllLevels());

  const [wrapperRef, setWrapperRef] = useState<HTMLDivElement | null>(null);
  const [search, setSearch] = useState('');

  const filteredIds = useMemo(() => {
    if (search === '' || search === '#') {
      return levelsIds;
    }

    if (search.startsWith('#')) {
      const levelNumber = Number.parseInt(search.slice(1));

      if (!Number.isNaN(levelNumber)) {
        return [levelsIds[levelNumber - 1]];
      }
    }

    return levelsIds.filter((levelId) => levelId.match(search));
  }, [levelsIds, search]);

  const itemData = useMemo(() => ({ filteredIds }), [filteredIds]);

  return (
    <div ref={setWrapperRef} className="col gap-4 h-full col text-sm">
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
  data: { filteredIds: string[] };
};

const Row = memo(({ index, style, data }: RowProps) => {
  const levelId = data.filteredIds[index];

  return (
    <div style={style}>
      <LevelRow key={levelId} levelId={levelId} />
    </div>
  );
}, areEqual);

Row.displayName = 'Row';

type LevelRowProps = {
  levelId: string;
};

const LevelRow = ({ levelId }: LevelRowProps) => {
  const definition = useLevelDefinition(levelId);
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
          {levelNumber && <Link href={`/level/${levelId}`}>#{levelNumber}</Link>}

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
        <Solutions levelId={levelId} />
      </div>

      <div className="px-4 min-w-[300px]">
        <Score levelId={levelId} />
      </div>

      <div className="px-4 min-w-[400px]">
        <Stats levelId={levelId} />
      </div>

      <div className="px-4">
        <Actions levelId={levelId} />
      </div>
    </div>
  );
};

type LeveLPreviewProps = {
  levelId: string;
  enableControls: boolean;
};

const LevelPreview = ({ levelId, enableControls }: LeveLPreviewProps) => {
  const definition = useLevelDefinition(levelId);
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
};

const Solutions = ({ levelId }: SolutionsProps) => {
  const solutions = useLevelSolutions(levelId);

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

type ScoreProps = {
  levelId: string;
};

const Score = ({ levelId }: ScoreProps) => {
  const solutions = useLevelSolutions(levelId);

  if (!solutions) {
    return null;
  }

  const { difficulty, numberOfSolutionsScore, easiestSolutionScore } = solutions;

  const r = 255 * Math.min(1, difficulty / 20);
  const g = 255 - r;
  const b = 0;

  return (
    <>
      <div className="font-semibold pb-2 text-base" style={{ color: `rgb(${r}, ${g}, ${b})` }}>
        Difficulty: {round(difficulty, 3)}
      </div>

      <div className="text-muted">Number of solutions score: {numberOfSolutionsScore}</div>
      <div className="text-muted">Easiest solution score: {easiestSolutionScore}</div>
    </>
  );
};

type StatsProps = {
  levelId: string;
};

const Stats = ({ levelId }: StatsProps) => {
  const stats = useLevelStats(levelId);

  if (!stats) {
    return <div className="text-muted">No stats.</div>;
  }

  return (
    <ul>
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

type ActionsProps = {
  levelId: string;
};

const Actions = ({ levelId }: ActionsProps) => {
  const validated = useIsLevelValidated(levelId);
  const levelsIds = useLevelsIds();
  const setLevelNumber = useSetLevelNumber(levelId);

  const nextLevelNumber = levelsIds.length;

  return (
    <ul className="list-disc list-inside">
      {!validated && (
        <li>
          <button onClick={() => setLevelNumber(nextLevelNumber)}>Validate</button>
        </li>
      )}
    </ul>
  );
};

const useAllLevelsIds = () => {
  return Object.keys(useAllLevels());
};

const useLevelDefinition = (levelId: string) => {
  const allLevels = useAllLevels();
  return allLevels[levelId];
};

const useLevelInstance = (levelId: string) => {
  return new Level(useLevelDefinition(levelId));
};

const useIsLevelValidated = (levelId: string) => {
  return useLevelsIds().includes(levelId);
};

const getAllLevels = async (): Promise<Record<string, LevelDefinition>> => {
  const { serverUrl } = getConfig();
  const response = await fetch(`${serverUrl}/levels/all`);

  return response.json() as Promise<Record<string, LevelDefinition>>;
};

const useAllLevels = () => {
  const { data } = useQuery({ queryKey: ['all-levels'], queryFn: getAllLevels });
  assert(data);
  return data;
};

const useUnvalidatedLevels = () => {
  const levelsIds = useLevelsIds();
  const allLevels = useAllLevels();

  return useMemo(() => {
    return toObject(
      Object.keys(allLevels).filter((id) => !levelsIds.includes(id)),
      identity,
      (levelId) => allLevels[levelId]
    );
  }, [allLevels, levelsIds]);
};

const getStats = async (): Promise<LevelsStats> => {
  const { serverUrl } = getConfig();
  const response = await fetch(`${serverUrl}/stats`);

  return response.json() as Promise<LevelsStats>;
};

const useLevelStats = (levelId: string) => {
  const { data } = useQuery({ queryKey: ['stats'], queryFn: getStats, refetchInterval: 5 * 1000 });
  assert(data);
  return data[levelId];
};

const getSolutions = async (): Promise<LevelsSolutions> => {
  const { serverUrl } = getConfig();
  const response = await fetch(`${serverUrl}/solutions`);

  return response.json() as Promise<LevelsSolutions>;
};

const useLevelSolutions = (levelId: string) => {
  const { data } = useQuery({ queryKey: ['solutions'], queryFn: getSolutions });
  assert(data);
  return data[levelId];
};

const setLevelNumber = async (levelId: string, levelNumber: number): Promise<void> => {
  const { serverUrl } = getConfig();

  await fetch(`${serverUrl}/level/${levelId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ levelNumber }),
  });
};

const useSetLevelNumber = (levelId: string) => {
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: (levelNumber: number) => setLevelNumber(levelId, levelNumber),
    onSuccess() {
      void queryClient.invalidateQueries(['levels']);
      void queryClient.invalidateQueries(['all-levels']);
    },
  });

  return mutate;
};

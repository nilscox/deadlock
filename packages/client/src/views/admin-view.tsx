import {
  defined,
  Direction,
  Game as GameClass,
  Level,
  LevelDefinition,
  LevelFlag,
  LevelsSolutions,
  LevelsStats,
  round,
} from '@deadlock/game';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CSSProperties, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { areEqual, FixedSizeList as List } from 'react-window';
import { Link } from 'wouter';

import { api } from '../api';
import { Game } from '../game/game';
import { useLevels } from '../game/levels-api';
import { toSearchParams, useSearchParam } from '../hooks/use-search-params';
import { copy } from '../utils';

// cspell:word unvalidated

export const AdminView = () => {
  const levelsIds = useAllLevelsIds();
  const levels = useLevels();

  const [wrapperRef, setWrapperRef] = useState<HTMLDivElement | null>(null);
  const [search, setSearch] = useSearchParam('search');
  const [flag, setFlag] = useSearchParam('flag');

  useEffect(() => {
    search === '' && setSearch(undefined);
  }, [search, setSearch]);

  useEffect(() => {
    flag === '' && setFlag(undefined);
  }, [flag, setFlag]);

  const filteredIds = useMemo(() => {
    const filterBySearchQuery = (ids: string[]) => {
      if (search === undefined || search === '#') {
        return ids;
      }

      if (search.startsWith('#')) {
        const levelNumber = Number.parseInt(search.slice(1));

        if (!Number.isNaN(levelNumber)) {
          const index = levelNumber - 1;

          if (!ids[index]) {
            return [];
          }

          return [ids[index]];
        }
      }

      return levelsIds.filter((levelId) => levelId.match(search));
    };

    const filterByFlag = (ids: string[]) => {
      if (!flag) {
        return ids;
      }

      return ids.filter((id) => {
        const level = levels[id] as unknown as { flags: LevelFlag[] };
        return level.flags.includes(flag as LevelFlag);
      });
    };

    return filterByFlag(filterBySearchQuery(levelsIds));
  }, [levelsIds, levels, search, flag]);

  const itemData = useMemo(() => ({ filteredIds }), [filteredIds]);

  return (
    <div ref={setWrapperRef} className="col gap-4 h-full col text-sm">
      <div className="row items-center p-4 gap-4">
        <input
          type="search"
          placeholder="Search..."
          className="px-2 py-1 outline-none border rounded flex-1"
          defaultValue={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select className="px-2 py-1" defaultValue={flag} onChange={(e) => setFlag(e.target.value)}>
          <option value="">Flags</option>
          {Object.values(LevelFlag).map((flag) => (
            <option key={flag} value={flag}>
              {flag}
            </option>
          ))}
        </select>
      </div>

      {filteredIds.length === 0 && <div className="py-10 text-center text-muted">No level found.</div>}

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

      <div className="px-4 min-w-[300px]">
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
  const level = useLevelDefinition(levelId) as unknown as { flags: LevelFlag[] };

  if (!solutions) {
    return null;
  }

  const { evaluatedDifficulty, effectiveDifficulty } = solutions;

  const r = 255 * Math.min(1, effectiveDifficulty / 4);
  const g = 255 - r;
  const b = 0;

  return (
    <>
      <div className="font-semibold pb-2 text-base" style={{ color: `rgb(${r}, ${g}, ${b})` }}>
        Effective difficulty: {round(effectiveDifficulty, 3)}
      </div>

      <div className="font-semibold pb-2">Evaluated difficulty: {round(evaluatedDifficulty, 3)}</div>

      {level.flags.length > 0 && <div>Flags: {level.flags.join(', ')}</div>}
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
  return `${Math.floor(time)}s`;
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
  const definition = useLevelDefinition(levelId);
  const setLevelNumber = useSetLevelNumber(levelId);
  const deleteLevel = useDeleteLevel(levelId);

  const handleeSetLevelNumber = () => {
    const input = window.prompt('Position:');

    if (!input) {
      return;
    }

    const value = Number.parseInt(input);

    if (Number.isNaN(value)) {
      alert('Invalid value');
      return;
    }

    setLevelNumber(value);
  };

  const handleDeleteLevel = () => {
    if (window.confirm('You sure?')) {
      deleteLevel();
    }
  };

  return (
    <ul className="list-disc list-inside">
      <li>
        <Link href={`/level-editor?${toSearchParams({ levelId, definition: JSON.stringify(definition) })}`}>
          Edit
        </Link>
      </li>

      <li>
        <button onClick={handleeSetLevelNumber}>Set position</button>
      </li>

      <li>
        <button onClick={handleDeleteLevel} className="text-red">
          Delete
        </button>
      </li>
    </ul>
  );
};

const useAllLevelsIds = () => {
  const allLevels = useAllLevels();
  return useMemo(() => allLevels.map(({ id }) => id), [allLevels]);
};

const useLevelNumber = (levelId: string) => {
  const allLevelsIds = useAllLevelsIds();
  return useMemo(() => allLevelsIds.indexOf(levelId) + 1, [levelId, allLevelsIds]);
};

const useLevelDefinition = (levelId: string) => {
  const allLevels = useAllLevels();

  const definition = useMemo(
    () => defined(allLevels.find(({ id }) => id === levelId)?.definition),
    [levelId, allLevels]
  );

  return definition;
};

const useLevelInstance = (levelId: string) => {
  return new Level(useLevelDefinition(levelId));
};

const useRefetchLevels = () => {
  const queryClient = useQueryClient();

  return useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['levels'] });
  }, [queryClient]);
};

const useAllLevels = () => {
  const { data } = useQuery({
    queryKey: ['levels', 'all'],
    queryFn: async () => {
      const result = await api.get<Record<string, LevelDefinition>>('/levels');
      return Object.entries(result).map(([id, definition]) => ({ id, definition }));
    },
  });

  return defined(data);
};

const useLevelStats = (levelId: string) => {
  const { data } = useQuery({
    queryKey: ['stats'],
    refetchInterval: 5 * 1000,
    queryFn: () => api.get<LevelsStats>('/stats'),
  });

  return defined(data)[levelId];
};

const useLevelSolutions = (levelId: string) => {
  const { data } = useQuery({
    queryKey: ['solutions'],
    queryFn: () => api.get<LevelsSolutions>('/solutions'),
  });

  return defined(data)[levelId];
};

const useSetLevelNumber = (levelId: string) => {
  const refetchLevels = useRefetchLevels();

  const { mutate } = useMutation({
    onSuccess: refetchLevels,
    mutationFn: (levelNumber: number) => api.patch(`/level/${levelId}`, { position: levelNumber }),
  });

  return mutate;
};

const useDeleteLevel = (levelId: string) => {
  const refetchLevels = useRefetchLevels();

  const { mutate } = useMutation({
    onSuccess: refetchLevels,
    mutationFn: () => api.delete(`/level/${levelId}`),
  });

  return mutate;
};

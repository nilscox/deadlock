import {
  defined,
  Direction,
  Game as GameClass,
  Level,
  LevelData,
  LevelDefinition,
  LevelSolutions,
  LevelsSolutions,
  LevelsStats,
  LevelStats,
} from '@deadlock/game';
import IconSort from '@heroicons/react/24/solid/ArrowsUpDownIcon';
import IconChevronDown from '@heroicons/react/24/solid/ChevronDownIcon';
import IconChevronRight from '@heroicons/react/24/solid/ChevronRightIcon';
import IconUnvalidate from '@heroicons/react/24/solid/EyeSlashIcon';
import IconEdit from '@heroicons/react/24/solid/PencilIcon';
import IconPlay from '@heroicons/react/24/solid/PlayIcon';
import IconDelete from '@heroicons/react/24/solid/XMarkIcon';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';

import { api } from '../api';
import { Game } from '../game/game';
import { useLevels } from '../game/levels-api';
import { useLevelDefinition } from '../game/levels-context';
import { useBoolean } from '../hooks/use-boolean';
import { toSearchParams } from '../hooks/use-search-params';
import { Link } from '../link';
import { copy } from '../utils';

export const AdminView = () => (
  <div className="h-full col">
    <nav className="p-4 row gap-6 text-lg font-semibold">
      <div className="py-2 border-b-2 border-black">Levels</div>
      <div className="py-2 text-muted">Sessions</div>
    </nav>

    <div className="p-4 flex-1 overflow-hidden">
      <LevelsTab />
    </div>
  </div>
);

const LevelsTab = () => {
  const levels = useLevels();
  const stats = useLevelsStats();
  const solutions = useLevelsSolutions();

  const data = useMemo<Data[]>(() => {
    return Object.keys(levels).map((levelId) => ({
      ...levels[levelId],
      solutions: solutions[levelId],
      stats: stats[levelId],
    }));
  }, [levels, stats, solutions]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    defaultColumn: { size: NaN },
  });

  const { rows } = table.getRowModel();

  return (
    <div className="border rounded overflow-auto h-full">
      <table className="border-collapse table-fixed w-full">
        <thead className="sticky z-10 top-0">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="py-2 px-2 bg-muted text-left"
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody className="divide-y">
          {rows.map((row) => (
            <Fragment key={row.id}>
              <tr>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-1 px-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>

              {row.getIsExpanded() && (
                <tr>
                  <td colSpan={row.getVisibleCells().length}>
                    <LevelDetails level={row.original} />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

type Data = LevelData & {
  stats: LevelStats;
  solutions: LevelSolutions;
};

const columnHelper = createColumnHelper<Data>();

const columns = [
  columnHelper.display({
    id: 'expand',
    size: 24,
    cell: ({ row }) => <Expand expanded={row.getIsExpanded()} onExpand={row.getToggleExpandedHandler()} />,
  }),

  columnHelper.accessor('number', {
    size: 40,
    header: () => <div className="w-9">#</div>,
    cell: ({ getValue }) => getValue(),
  }),

  columnHelper.accessor('id', {
    size: 90,
    header: 'ID',
    cell: ({ getValue }) => getValue(),
  }),

  columnHelper.accessor('stats.played', {
    size: 90,
    header: 'Played',
    cell: ({ getValue }) => getValue(),
  }),

  columnHelper.accessor('stats.playTime', {
    size: 200,
    header: 'Time',
    cell: ({ getValue }) => <PlayTime {...getValue()} />,
  }),

  columnHelper.accessor('stats.tries', {
    size: 160,
    header: 'Tries',
    cell: ({ getValue }) => <Tries {...getValue()} />,
  }),

  columnHelper.accessor('solutions', {
    size: 90,
    header: 'Solutions',
    cell: ({ getValue }) => <>{getValue().total}</>,
  }),

  columnHelper.accessor('solutions', {
    size: 160,
    id: 'difficulty',
    header: 'Difficulty',
    cell: ({ getValue }) => <Difficulty {...getValue()} />,
  }),

  columnHelper.accessor('flags', {
    size: 140,
    header: 'Flags',
    cell: ({ getValue }) => <>{getValue().join(', ')}</>,
  }),

  columnHelper.display({
    size: 120,
    id: 'copy',
    header: 'Copy',
    cell: ({ row }) => <Copy level={row.original} />,
  }),

  columnHelper.display({
    size: 160,
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <Actions levelId={row.original.id} />,
  }),
];

type ExpandProps = {
  expanded: boolean;
  onExpand: () => void;
};

const Expand = ({ expanded, onExpand }: ExpandProps) => (
  <button onClick={onExpand}>
    {expanded ? <IconChevronDown className="w-4 h-4" /> : <IconChevronRight className="w-4 h-4" />}
  </button>
);

type PlayTimeProps = {
  mean: number;
  min: number;
  max: number;
};

const PlayTime = ({ mean, min, max }: PlayTimeProps) => (
  <>
    {mean}s
    <span className="ml-2 text-muted text-sm">
      (min: {min}s, max; {max}s)
    </span>
  </>
);

type TriesProps = {
  mean: number;
  min: number;
  max: number;
};

const Tries = ({ mean, min, max }: TriesProps) => (
  <>
    {mean}
    <span className="ml-2 text-muted text-sm">
      (min: {min}, max: {max})
    </span>
  </>
);

type DifficultyProps = {
  effectiveDifficulty: number;
  evaluatedDifficulty: number;
};

const Difficulty = ({ effectiveDifficulty, evaluatedDifficulty }: DifficultyProps) => {
  const [r, g, b] = useMemo(() => {
    const r = 255 * Math.min(1, effectiveDifficulty / 6);
    const g = 255 - r;
    const b = 0;

    return [r, g, b];
  }, [effectiveDifficulty]);

  return (
    <>
      <span className="font-bold" style={{ color: `rgb(${r}, ${g}, ${b})` }}>
        {effectiveDifficulty}
      </span>

      <span className="ml-2 text-muted text-sm">(evaluated: {evaluatedDifficulty})</span>
    </>
  );
};

type CopyProps = {
  level: Data;
};

const Copy = ({ level }: CopyProps) => {
  const getJSON = () => {
    return JSON.stringify(level.definition);
  };

  const getHash = () => {
    return new Level(level.definition).hash;
  };

  const getFingerprint = () => {
    return new Level(level.definition).fingerprint;
  };

  return (
    <ul className="row gap-4">
      <li>
        <button onClick={() => copy(getJSON())}>JSON</button>
      </li>

      <li>
        <button onClick={() => copy(getHash())}>hash</button>
      </li>

      <li>
        <button onClick={() => copy(getFingerprint())}>FP</button>
      </li>
    </ul>
  );
};

type ActionsProps = {
  levelId: string;
};

const Actions = ({ levelId }: ActionsProps) => {
  const definition = useLevelDefinition(levelId);
  const setLevelNumber = useSetLevelNumber(levelId);
  const deleteLevel = useDeleteLevel(levelId);

  const handleSetLevelNumber = () => {
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

  const handleUnvalidate = () => {
    if (!window.confirm(`Level ${levelId} will be unvalidated. Continue?`)) {
      return;
    }

    setLevelNumber(null);
  };

  const handleDeleteLevel = () => {
    if (!window.confirm(`Level ${levelId} will be (soft) deleted. Continue?`)) {
      deleteLevel();
    }
  };

  return (
    <ul className="row gap-6 text-muted items-center">
      <li title="Test level">
        <Link href={`/test?${toSearchParams({ levelId, definition: JSON.stringify(definition) })}`}>
          <IconPlay className="h-5 w-5" />
        </Link>
      </li>

      <li title="Edit level">
        <Link href={`/level-editor?${toSearchParams({ levelId, definition: JSON.stringify(definition) })}`}>
          <IconEdit className="h-5 w-5" />
        </Link>
      </li>

      <li title="Change level position">
        <button onClick={handleSetLevelNumber}>
          <IconSort className="h-5 w-5" />
        </button>
      </li>

      <li title="Unvalidate level">
        <button onClick={handleUnvalidate}>
          <IconUnvalidate className="h-5 w-5" />
        </button>
      </li>

      <li title="Delete level">
        <button onClick={handleDeleteLevel}>
          <IconDelete className="h-5 w-5 text-red" />
        </button>
      </li>
    </ul>
  );
};

type LevelDetailsProps = {
  level: Data;
};

const LevelDetails = ({ level }: LevelDetailsProps) => {
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

const useRefetchLevels = () => {
  const queryClient = useQueryClient();

  return useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['levels'] });
  }, [queryClient]);
};

const useLevelsStats = () => {
  const { data } = useQuery({
    queryKey: ['stats'],
    refetchInterval: 5 * 1000,
    queryFn: () => api.get<LevelsStats>('/stats'),
  });

  return defined(data);
};

const useLevelsSolutions = () => {
  const { data } = useQuery({
    queryKey: ['solutions'],
    queryFn: () => api.get<LevelsSolutions>('/solutions'),
  });

  return defined(data);
};

const useSetLevelNumber = (levelId: string) => {
  const refetchLevels = useRefetchLevels();

  const { mutate } = useMutation({
    onSuccess: refetchLevels,
    mutationFn: (levelNumber: number | null) => api.patch(`/level/${levelId}`, { position: levelNumber }),
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

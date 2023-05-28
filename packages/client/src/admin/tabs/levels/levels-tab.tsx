import { defined, LevelData, LevelSolutions, LevelsSolutions, LevelsStats, LevelStats } from '@deadlock/game';
import { useQuery } from '@tanstack/react-query';
import { getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo } from 'react';

import { api } from '~/api';
import { useLevels } from '~/game/levels-api';

import { Table, TableBody, TableHeader } from '~/components/table';
import { levelsColumns } from './level-columns';
import { LevelDetails } from './level-details';

export type LevelRow = LevelData & {
  stats: LevelStats;
  solutions: LevelSolutions;
};

export const LevelsTab = () => {
  const levels = useLevels();
  const stats = useLevelsStats();
  const solutions = useLevelsSolutions();

  const data = useMemo<LevelRow[]>(() => {
    return Object.keys(levels).map((levelId) => ({
      ...levels[levelId],
      solutions: solutions[levelId],
      stats: stats[levelId],
    }));
  }, [levels, stats, solutions]);

  const table = useReactTable({
    data,
    columns: levelsColumns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
  });

  return (
    <div className="border rounded overflow-auto h-full">
      <Table>
        <TableHeader table={table} />
        <TableBody table={table} renderExpanded={(level) => <LevelDetails level={level} />} />
      </Table>
    </div>
  );
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

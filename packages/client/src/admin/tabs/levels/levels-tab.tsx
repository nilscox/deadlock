import { LevelData, LevelsStats, LevelStats } from '@deadlock/game';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo } from 'react';

import { api } from '~/api';
import { Table, TableBody, TableHeader } from '~/components/table';
import { useLevels } from '~/game/levels-api';

import { levelsColumns } from './level-columns';
import { LevelDetails } from './level-details';

export type LevelRow = LevelData & {
  stats: LevelStats;
};

export const LevelsTab = () => {
  const levels = useLevels();
  const stats = useLevelsStats(Object.keys(levels));

  const data = useMemo<LevelRow[]>(() => {
    return Object.keys(levels).map((levelId) => ({
      ...levels[levelId],
      stats: stats[levelId],
    }));
  }, [levels, stats]);

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

const useLevelsStats = (levelIds: string[]) => {
  const { data } = useSuspenseQuery({
    queryKey: ['stats', levelIds],
    refetchInterval: 5 * 1000,
    queryFn: () => api.get<LevelsStats>(`/stats?${params(levelIds)}`),
  });

  return data;
};

const params = (levelIds: string[]) => {
  const search = new URLSearchParams();

  levelIds.forEach((levelId) => search.append('levelId', levelId));

  return search.toString();
};

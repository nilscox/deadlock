import { defined, LevelData, LevelSolutions, LevelsSolutions, LevelsStats, LevelStats } from '@deadlock/game';
import { useQuery } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  Table,
  useReactTable,
} from '@tanstack/react-table';
import { Fragment, useMemo } from 'react';

import { api } from '~/api';
import { useLevels } from '~/game/levels-api';

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
    defaultColumn: { size: NaN },
  });

  return (
    <div className="border rounded overflow-auto h-full">
      <table className="border-collapse table-fixed w-full">
        <TableHeaders table={table} />
        <TableBody table={table} />
      </table>
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

type TableHeadersProps = {
  table: Table<LevelRow>;
};

const TableHeaders = ({ table }: TableHeadersProps) => (
  <thead className="sticky z-10 top-0">
    {table.getHeaderGroups().map((headerGroup) => (
      <tr key={headerGroup.id}>
        {headerGroup.headers.map((header) => (
          <th key={header.id} className="py-2 px-2 bg-muted text-left" style={{ width: header.getSize() }}>
            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
          </th>
        ))}
      </tr>
    ))}
  </thead>
);

type TableBodyProps = {
  table: Table<LevelRow>;
};

const TableBody = ({ table }: TableBodyProps) => (
  <tbody className="divide-y">
    {table.getRowModel().rows.map((row) => (
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
);

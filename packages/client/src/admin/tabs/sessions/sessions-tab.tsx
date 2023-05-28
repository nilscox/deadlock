import { defined } from '@deadlock/game';
import { LevelSession } from '@deadlock/game/src/types';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import { api } from '~/api';
import { Table, TableBody, TableHeader } from '~/components/table';

export const SessionsTab = () => {
  const sessions = useSessions();

  const table = useReactTable({
    data: sessions,
    columns: sessionsColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="border rounded overflow-auto h-full">
      <Table>
        <TableHeader table={table} />
        <TableBody table={table} />
      </Table>
    </div>
  );
};

const useSessions = () => {
  const { data } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.get<LevelSession[]>('/sessions'),
    refetchInterval: 5 * 1000,
  });

  return defined(data);
};

const columnHelper = createColumnHelper<LevelSession>();

export const sessionsColumns = [
  columnHelper.accessor('id', {
    cell: ({ getValue }) => getValue(),
  }),

  columnHelper.accessor('levelId', {
    cell: ({ getValue }) => getValue(),
  }),

  columnHelper.accessor('date', {
    cell: ({ getValue }) => dateFormatter.format(new Date(getValue())),
  }),

  columnHelper.accessor('time', {
    cell: ({ getValue }) => `${Math.ceil(getValue() / 1000)}s`,
  }),

  columnHelper.accessor('tries', {
    cell: ({ getValue }) => getValue(),
  }),

  columnHelper.accessor('completed', {
    cell: ({ getValue }) => (getValue() ? 'yes' : 'no'),
  }),
];

const dateFormatter = new Intl.DateTimeFormat([], { dateStyle: 'medium', timeStyle: 'medium' });

import { LevelSession } from '@deadlock/game/src/types';
import IconDelete from '@heroicons/react/24/solid/XMarkIcon';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import { api } from '~/api';
import { Duration } from '~/components/duration';
import { Table, TableBody, TableHeader } from '~/components/table';

const columnHelper = createColumnHelper<LevelSession>();
const dateFormatter = new Intl.DateTimeFormat([], { dateStyle: 'medium', timeStyle: 'medium' });

const columns = [
  columnHelper.accessor('date', {
    size: 50,
    header: 'Date',
    cell: ({ getValue }) => dateFormatter.format(new Date(getValue())),
  }),

  columnHelper.accessor('time', {
    size: 1,
    header: 'Time',
    cell: ({ getValue }) => <Duration value={getValue()} />,
  }),

  columnHelper.accessor('tries', {
    size: 1,
    header: 'Tries',
    cell: ({ getValue }) => getValue(),
  }),

  columnHelper.accessor('completed', {
    size: 1,
    header: 'Completed',
    cell: ({ getValue }) => (getValue() ? 'yes' : 'no'),
  }),

  columnHelper.accessor('levelId', {
    size: 1,
    header: 'Actions',
    cell: ({ getValue, row }) => <Actions levelId={getValue()} sessionId={row.original.id} />,
  }),
];

type SessionsListProps = {
  levelId: string;
};

export const SessionsList = ({ levelId }: SessionsListProps) => {
  const { data } = useSuspenseQuery({
    queryKey: ['sessions', levelId],
    queryFn: () => api.get<LevelSession[]>(`/level/${levelId}/sessions`),
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-4">
      Sessions
      <Table className="border rounded max-w-3xl">
        <TableHeader table={table} />
        <TableBody table={table} />
      </Table>
    </div>
  );
};

type ActionsProps = {
  levelId: string;
  sessionId: string;
};

export const Actions = ({ levelId, sessionId }: ActionsProps) => {
  const queryClient = useQueryClient();

  const { mutate: deleteSession } = useMutation({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sessions', levelId] });
      void queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
    mutationFn: () => api.delete(`/session/${sessionId}`),
  });

  return (
    <ul className="row gap-6 text-muted items-center">
      <li title="Delete level">
        <button onClick={() => deleteSession()}>
          <IconDelete className="h-5 w-5 text-red" />
        </button>
      </li>
    </ul>
  );
};

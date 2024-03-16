import { createColumnHelper } from '@tanstack/react-table';

import { LevelRow } from './admin-view';
import { Difficulty } from './columns/difficulty-column';
import { ExpandColumn } from './columns/expand-column';
import { Actions } from './columns/level-actions-column';
import { PlayTimeColumn } from './columns/play-time-column';
import { TriesColumn } from './columns/tries-column';

const columnHelper = createColumnHelper<LevelRow>();

export const levelsColumns = [
  columnHelper.display({
    id: 'expand',
    size: 24,
    cell: ({ row }) => (
      <ExpandColumn expanded={row.getIsExpanded()} onExpand={row.getToggleExpandedHandler()} />
    ),
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
    cell: ({ getValue }) => {
      const value = getValue();

      if (!value) {
        return null;
      }

      return <PlayTimeColumn {...value} />;
    },
  }),

  columnHelper.accessor('stats.tries', {
    size: 160,
    header: 'Tries',
    cell: ({ getValue }) => {
      const value = getValue();

      if (!value) {
        return null;
      }

      return <TriesColumn {...value} />;
    },
  }),

  columnHelper.accessor('difficulty', {
    size: 160,
    id: 'difficulty',
    header: 'Difficulty',
    cell: ({ getValue }) => <Difficulty {...getValue()} />,
  }),

  columnHelper.display({
    size: 160,
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <Actions levelId={row.original.id} />,
  }),
];

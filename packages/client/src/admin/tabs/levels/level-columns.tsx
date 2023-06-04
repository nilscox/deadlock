import { createColumnHelper } from '@tanstack/react-table';

import { Copy } from './columns/copy-level-info-column';
import { Difficulty } from './columns/difficulty-column';
import { ExpandColumn } from './columns/expand-column';
import { Actions } from './columns/level-actions-column';
import { PlayTimeColumn } from './columns/play-time-column';
import { TriesColumn } from './columns/tries-column';
import { LevelRow } from './levels-tab';

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
    cell: ({ getValue }) => <PlayTimeColumn {...getValue()} />,
  }),

  columnHelper.accessor('stats.tries', {
    size: 160,
    header: 'Tries',
    cell: ({ getValue }) => <TriesColumn {...getValue()} />,
  }),

  columnHelper.display({
    id: 'specs',
    size: 90,
    header: 'Specs',
    cell: ({ row }) => {
      const level = row.original;

      return (
        <>
          {level.definition.width}×{level.definition.height}×{level.definition.blocks.length}
          {level.definition.teleports.length > 0 && '+T'}{' '}
          <span className="text-muted text-sm">({level.solutions.items.length})</span>
        </>
      );
    },
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

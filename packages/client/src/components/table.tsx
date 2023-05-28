import { Table as TableType, flexRender } from '@tanstack/react-table';
import { clsx } from 'clsx';
import { Fragment } from 'react';

type TableProps = React.HTMLAttributes<HTMLTableElement>;

export const Table = ({ className, ...props }: TableProps) => (
  <table className={clsx('border-collapse table-fixed w-full', className)} {...props} />
);

type TableHeadersProps<Row> = {
  table: TableType<Row>;
};

export const TableHeader = <Row,>({ table }: TableHeadersProps<Row>) => (
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

type TableBodyProps<Row> = {
  table: TableType<Row>;
  renderExpanded?: (row: Row) => React.ReactNode;
};

export const TableBody = <Row,>({ table, renderExpanded }: TableBodyProps<Row>) => (
  <tbody className="divide-y">
    {table.getRowModel().rows.map((row) => (
      <Fragment key={row.id}>
        <tr className="hover:bg-muted/50">
          {row.getVisibleCells().map((cell) => (
            <td key={cell.id} className="py-1 px-2">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>

        {row.getIsExpanded() && renderExpanded && (
          <tr>
            <td colSpan={row.getVisibleCells().length}>{renderExpanded(row.original)}</td>
          </tr>
        )}
      </Fragment>
    ))}
  </tbody>
);

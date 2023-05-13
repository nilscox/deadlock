import { CellType, Level, LevelDefinition, Cell as TCell, array } from '@deadlock/game';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { clsx } from 'clsx';
import { forwardRef, useMemo, useState } from 'react';

const clone = <T,>(value: T): T => {
  return JSON.parse(JSON.stringify(value)) as T;
};

type LevelEditorProps = {
  definition: LevelDefinition;
  onChange: (definition: LevelDefinition) => void;
};

export const LevelEditor = ({ definition, onChange }: LevelEditorProps) => {
  const level = useMemo(() => new Level(definition), [definition]);
  const areas = useMemo(() => gridTemplateAreas(definition), [definition]);

  const [dragging, setDragging] = useState<TCell>();

  const handleDragStart = (event: DragStartEvent) => {
    setDragging(event.active.data.current as TCell);
  };

  const handleDragEn = (event: DragEndEvent) => {
    setDragging(undefined);

    const isNew = String(event.active.id).startsWith('new');
    const dragging = event.active.data.current as TCell;

    if (event.over) {
      const target = event.over.data.current as TCell;

      if (!isNew) {
        level.set(dragging.x, dragging.y, CellType.empty);
      }

      level.set(target.x, target.y, dragging.type);
    } else {
      if (dragging.type === CellType.player) {
        return;
      }

      level.set(dragging.x, dragging.y, CellType.empty);
    }

    onChange(clone(level.definition));
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEn}>
      <div
        className="border p-4 grid max-w-xl"
        style={{
          gridTemplateAreas: areas,
          gridTemplateColumns: `repeat(${level.definition.width}, 1fr)`,
        }}
      >
        {level.cells(CellType.empty).map((cell) => (
          <DroppableCell key={cellId(cell)} cell={cell} />
        ))}

        {level
          .cells()
          .filter(({ type }) => type !== CellType.empty)
          .map((cell) => (
            <DraggableCell key={cellId(cell)} cell={cell} />
          ))}
      </div>

      <div
        className="mt-4 grid max-w-xl gap-4"
        style={{ gridTemplateRows: 1, gridTemplateColumns: `repeat(${level.definition.width}, 1fr)` }}
      >
        <DraggableCellNew type={CellType.block} />
        <DraggableCellNew type={CellType.teleport} />
      </div>

      <DragOverlay dropAnimation={null}>{dragging && <Cell type={dragging.type} />}</DragOverlay>
    </DndContext>
  );
};

const gridTemplateAreas = (definition: LevelDefinition): string => {
  const { width, height } = definition;
  return array(height, (y) => '"' + array(width, (x) => gridArea(x, y)).join(' ') + '"').join('\n');
};

const gridArea = (x: number, y: number) => {
  return `_${x}_${y}`;
};

const cellId = (cell: TCell) => {
  return `${cell.x},${cell.y}`;
};

type DroppableCellProps = {
  cell: TCell;
};

const DroppableCell = ({ cell }: DroppableCellProps) => {
  const { x, y } = cell;

  const { isOver, setNodeRef } = useDroppable({
    id: `droppable-${cellId(cell)}`,
    data: cell,
  });

  return (
    <div
      ref={setNodeRef}
      className={clsx('aspect-square', isOver && 'bg-muted')}
      style={{ gridArea: gridArea(x, y) }}
    />
  );
};

type DraggableCellProps = {
  cell: TCell;
};

const DraggableCell = ({ cell }: DraggableCellProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `draggable-${cellId(cell)}`,
    data: cell,
  });

  return (
    <Cell
      ref={setNodeRef}
      type={cell.type}
      className={clsx('outline-none', isDragging && 'opacity-50')}
      style={{ gridArea: gridArea(cell.x, cell.y) }}
      {...listeners}
      {...attributes}
    />
  );
};

type DraggableCellNewProps = {
  type: CellType;
};

const DraggableCellNew = ({ type }: DraggableCellNewProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new-${type}`,
    data: { type },
  });

  return (
    <Cell
      ref={setNodeRef}
      type={type}
      className={clsx('outline-none', isDragging && 'opacity-50')}
      {...listeners}
      {...attributes}
    />
  );
};

const colors: Record<CellType, string> = {
  [CellType.empty]: '#FFF',
  [CellType.block]: '#CCC',
  [CellType.path]: '#EEE',
  [CellType.player]: '#99F',
  [CellType.teleport]: '#CFF',
};

type CellProps = React.HTMLProps<HTMLDivElement> & {
  type: CellType;
};

const Cell = forwardRef<HTMLDivElement, CellProps>(({ type, className, style, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx('aspect-square', className)}
      style={{ background: colors[type], ...style }}
      {...props}
    />
  );
});

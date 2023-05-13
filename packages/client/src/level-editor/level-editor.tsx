import { CellType, IPoint, Level, LevelDefinition, Cell as TCell, array } from '@deadlock/game';
import { DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { clsx } from 'clsx';
import { useMemo, useState } from 'react';

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

  const handleDragEn = (event: DragEndEvent) => {
    if (!event.over) {
      return;
    }

    const dragging = event.active.data.current as TCell;
    const target = event.over.data.current as TCell;

    level.set(dragging.x, dragging.y, CellType.empty);
    level.set(target.x, target.y, dragging.type);

    onChange(clone(level.definition));
  };

  return (
    <DndContext key={JSON.stringify(definition)} onDragEnd={handleDragEn}>
      <div
        className="border p-4 grid max-w-xl"
        style={{
          gridTemplateAreas: areas,
          gridTemplateColumns: `repeat(${level.definition.width}, 1fr)`,
        }}
      >
        {level.cells(CellType.empty).map((cell) => (
          <DroppableCell key={`${cell.x},${cell.y}`} {...cell} />
        ))}

        {level
          .cells()
          .filter((cell) => cell.type !== CellType.empty)
          .map((cell) => (
            <DraggableCell key={`${cell.x},${cell.y}`} {...cell} />
          ))}
      </div>
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

const colors: Record<CellType, string> = {
  [CellType.empty]: '#FFF',
  [CellType.block]: '#CCC',
  [CellType.path]: '#EEE',
  [CellType.player]: '#99F',
  [CellType.teleport]: '#CFF',
};

const DroppableCell = (cell: TCell) => {
  const { x, y } = cell;

  const { isOver, setNodeRef } = useDroppable({
    id: `droppable-${x},${y}`,
    data: { x, y },
  });

  return (
    <div
      ref={setNodeRef}
      className={clsx('aspect-square', isOver && 'bg-muted')}
      style={{ gridArea: gridArea(x, y) }}
    />
  );
};

const DraggableCell = (cell: TCell) => {
  const { x, y } = cell;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `draggable-${x},${y}`,
    data: cell,
  });

  return (
    <div
      ref={setNodeRef}
      className={clsx('aspect-square outline-none', isDragging && 'opacity-75 z-10')}
      style={{
        gridArea: gridArea(x, y),
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        background: colors[cell.type],
      }}
      {...listeners}
      {...attributes}
    />
  );
};

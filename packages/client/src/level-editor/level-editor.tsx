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
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';

import { Translate } from '~/components/translate';

const { useTranslation } = Translate.prefix('levelEditor');

const clone = <T,>(value: T): T => {
  return JSON.parse(JSON.stringify(value)) as T;
};

type OnDefinitionChange = (definition: LevelDefinition) => void;

type LevelEditorProps = {
  definition: LevelDefinition;
  onChange: OnDefinitionChange;
};

export const LevelEditor = ({ definition, onChange }: LevelEditorProps) => {
  const t = useTranslation();
  const level = useMemo(() => Level.load(definition), [definition]);

  const handleChangeSize = useSizeChangeHandler(level, onChange);
  const [dragging, handleDragStart, handleDragEnd] = useDragHandlers(level, onChange);

  useEffect(() => {
    document.documentElement.classList.add('no-touch');
    return () => document.documentElement.classList.remove('no-touch');
  });

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="col gap-8 flex-1 justify-center items-center">
        <CellsGrid level={level} />
        <NewCells />
      </div>

      <DragOverlay dropAnimation={null}>{dragging && <Cell type={dragging.type} />}</DragOverlay>

      <div className="col gap-4 py-8">
        <Slider
          label={t('width')}
          value={definition.width}
          onChange={(width) => handleChangeSize({ width })}
        />
        <Slider
          label={t('height')}
          value={definition.height}
          onChange={(height) => handleChangeSize({ height })}
        />
      </div>
    </DndContext>
  );
};

type SliderProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

const Slider = ({ label, value, onChange }: SliderProps) => (
  <div className="row items-center">
    <label className="w-20">{label}</label>
    <input
      className="flex-1 mx-4"
      type="range"
      min={0}
      max={6}
      step={1}
      value={value}
      onChange={(event) => onChange(event.target.valueAsNumber)}
    />
    <div>{value}</div>
  </div>
);

const useSizeChangeHandler = (level: Level, onChange: OnDefinitionChange) => {
  return useCallback(
    (size: Partial<Record<'width' | 'height', number>>) => {
      const def = { ...level.definition, ...size };
      const { width, height } = def;

      if (def.start.x >= width || def.start.y >= height) {
        return;
      }

      for (const cell of def.blocks) {
        if (cell.x >= width || cell.y >= height) {
          def.blocks.splice(def.blocks.indexOf(cell), 1);
        }
      }

      for (const cell of def.teleports) {
        if (cell.x >= width || cell.y >= height) {
          def.teleports.splice(def.teleports.indexOf(cell), 1);
        }
      }

      onChange(def);
    },
    [level, onChange]
  );
};

const useDragHandlers = (level: Level, onChange: OnDefinitionChange) => {
  const [dragging, setDragging] = useState<TCell>();

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setDragging(event.active.data.current as TCell);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
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
    },
    [level, onChange]
  );

  return [dragging, handleDragStart, handleDragEnd] as const;
};

const cellId = (cell: TCell) => {
  return `${cell.x},${cell.y}`;
};

type CellsGridProps = {
  level: Level;
};

const CellsGrid = ({ level }: CellsGridProps) => {
  const areas = useMemo(() => gridTemplateAreas(level.definition), [level]);

  return (
    <div
      className="border grid"
      style={{
        gridTemplateAreas: areas,
        gridTemplateColumns: `repeat(${level.definition.width}, 1fr)`,
      }}
    >
      {level.map.cells(CellType.empty).map((cell) => (
        <DroppableCell key={cellId(cell)} cell={cell} />
      ))}

      {level.map
        .cells()
        .filter(({ type }) => type !== CellType.empty)
        .map((cell) => (
          <DraggableCell key={cellId(cell)} cell={cell} />
        ))}
    </div>
  );
};

const gridTemplateAreas = (definition: LevelDefinition): string => {
  const { width, height } = definition;
  return array(height, (y) => '"' + array(width, (x) => gridArea(x, y)).join(' ') + '"').join('\n');
};

const gridArea = (x: number, y: number) => {
  return `_${x}_${y}`;
};

const NewCells = () => (
  <div className="row gap-4 justify-center">
    <DraggableCellNew type={CellType.block} />
    <DraggableCellNew type={CellType.teleport} />
  </div>
);

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
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `new-${type}`,
    data: { type },
  });

  return <Cell ref={setNodeRef} type={type} className="outline-none" {...listeners} {...attributes} />;
};

const colors: Record<CellType, string> = {
  [CellType.empty]: clsx('bg-[#FFF]'),
  [CellType.block]: clsx('bg-[#CCC]'),
  [CellType.path]: clsx('bg-[#EEE]'),
  [CellType.player]: clsx('bg-[#99F]'),
  [CellType.teleport]: clsx('bg-[#CFF]'),
};

type CellProps = React.HTMLProps<HTMLDivElement> & {
  type: CellType;
};

const Cell = forwardRef<HTMLDivElement, CellProps>(({ type, className, ...props }, ref) => (
  <div ref={ref} className={clsx('w-[40px] md:w-[60px] aspect-square', colors[type], className)} {...props} />
));

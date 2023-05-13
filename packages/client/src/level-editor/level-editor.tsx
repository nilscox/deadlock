import { CellType, Level, LevelDefinition, Cell as TCell, array, solve } from '@deadlock/game';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { clsx } from 'clsx';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { Link } from 'wouter';

const clone = <T,>(value: T): T => {
  return JSON.parse(JSON.stringify(value)) as T;
};

type OnDefinitionChange = (definition: LevelDefinition) => void;

type LevelEditorProps = {
  definition: LevelDefinition;
  onChange: OnDefinitionChange;
};

export const LevelEditor = ({ definition, onChange }: LevelEditorProps) => {
  const level = useMemo(() => new Level(definition), [definition]);
  const solutions = useMemo(() => solve(new Level(clone(definition)), 500), [definition]);

  const handleChangeSize = useSizeChangeHandler(level, onChange);
  const [dragging, handleDragStart, handleDragEnd] = useDragHandlers(level, onChange);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="col gap-4 p-4 max-w-lg md:max-w-2xl">
        <div className="row">
          <div>Solutions: {solutions === undefined ? '> 500' : solutions.length}</div>
          <Link to={`/test?hash=${level.hash}`} className="ml-auto row items-center gap-2">
            Test <div className="text-muted">➜</div>
          </Link>
        </div>

        <div className="row">
          <HeightSlider height={definition.height} onChange={(height) => handleChangeSize({ height })} />

          <div className="flex-1 col">
            <div className="flex-1 col items-center justify-center">
              <CellsGrid level={level} />
            </div>

            <WidthSlider width={definition.width} onChange={(width) => handleChangeSize({ width })} />
          </div>

          <NewCells />
        </div>
      </div>

      <DragOverlay dropAnimation={null}>{dragging && <Cell type={dragging.type} />}</DragOverlay>
    </DndContext>
  );
};

type WidthSliderProps = {
  width: number;
  onChange: (width: number) => void;
};

const WidthSlider = ({ width, onChange }: WidthSliderProps) => (
  <div className="col items-center">
    <input
      className="w-full"
      type="range"
      min={0}
      max={6}
      step={1}
      value={width}
      onChange={(event) => onChange(event.target.valueAsNumber)}
    />
    {width}
  </div>
);

type HeightSliderProps = {
  height: number;
  onChange: (height: number) => void;
};

const HeightSlider = ({ height, onChange }: HeightSliderProps) => (
  <div className="row items-center h-[300px] md:h-[480px] gap-1 pb-10">
    {height}
    <input
      type="range"
      min={0}
      max={6}
      step={1}
      className="w-4 h-full"
      style={{ WebkitAppearance: 'slider-vertical' }}
      value={height}
      onChange={(event) => onChange(event.target.valueAsNumber)}
    />
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
  <div className="col gap-4 justify-center w-[40px] md:w-[80px] ml-4">
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
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
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

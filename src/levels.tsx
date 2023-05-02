import { useLevels } from './use-levels';

type LevelsProps = {
  selectLevel: (id: string) => void;
};

export const Levels = ({ selectLevel }: LevelsProps) => {
  const [levels] = useLevels();

  return (
    <div>
      <div style={{ fontSize: '2em', paddingTop: 32, textAlign: 'center' }}>Levels</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: 32 }}>
        {Object.entries(levels).map(([id, { completed }]) => (
          <Level key={id} id={id} completed={completed !== undefined} onClick={() => selectLevel(id)} />
        ))}
      </div>
    </div>
  );
};

type LevelProps = {
  id: string;
  completed: boolean;
  onClick: () => void;
};

const Level = ({ id, completed, onClick }: LevelProps) => {
  return (
    <button
      style={{
        height: 64,
        cursor: 'pointer',
        border: 'none',
        background: '#EEE',
        borderRadius: 6,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: completed ? 0.5 : undefined,
      }}
      onClick={onClick}
    >
      {id}
    </button>
  );
};

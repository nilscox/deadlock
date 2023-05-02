import { levels } from './game/levels';

type LevelsProps = {
  selectLevel: (id: string) => void;
};

export const Levels = ({ selectLevel }: LevelsProps) => {
  return (
    <div>
      <div style={{ fontSize: '2em', paddingTop: 32, textAlign: 'center' }}>Levels</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: 32 }}>
        {Object.keys(levels).map((id) => (
          <Level key={id} id={id} onClick={() => selectLevel(id)} />
        ))}
      </div>
    </div>
  );
};

type LevelProps = {
  id: string;
  onClick: () => void;
};

const Level = ({ id, onClick }: LevelProps) => {
  return (
    <div
      style={{
        height: 64,
        background: '#EEE',
        borderRadius: 6,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onClick={onClick}
    >
      {id}
    </div>
  );
};

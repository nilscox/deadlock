import { useState } from 'react';

import { Game } from './game';
import { levels } from './game/levels';
import { Levels } from './levels';

const levelIds = Object.keys(levels);
const nextLevelId = (id: string) => levelIds[levelIds.indexOf(id) + 1];

function App() {
  const [levelId, setLevelId] = useState<string | undefined>(Object.keys(levels)[0]);

  if (levelId === undefined) {
    return <Levels selectLevel={setLevelId} />;
  }

  return (
    <Game
      levelId={levelId}
      showLevels={() => setLevelId(undefined)}
      nextLevel={() => setLevelId(nextLevelId(levelId))}
    />
  );
}

export default App;

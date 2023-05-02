import { useCallback, useState } from 'react';

import { Game } from './game';
import { levels } from './game/levels';
import { Levels } from './levels';
import { useLevels } from './use-levels';

const levelIds = Object.keys(levels);
const nextLevelId = (id: string) => levelIds[levelIds.indexOf(id) + 1];

function App() {
  const [levels] = useLevels();

  const [levelId, setLevelId] = useState<string | undefined>(
    Object.entries(levels).find(([, level]) => !level.completed)?.[0]
  );

  const nextLevel = useCallback(() => {
    setLevelId((levelId) => nextLevelId(levelId as string));
  }, []);

  if (levelId === undefined) {
    return <Levels selectLevel={setLevelId} />;
  }

  return <Game levelId={levelId} showLevels={() => setLevelId(undefined)} nextLevel={nextLevel} />;
}

export default App;

import { Redirect, Route } from 'wouter';

import { Game } from './views/game';
import { Levels } from './views/levels';
import { useLevels } from './use-levels';

const RedirectToNextLevel = () => {
  const [levels] = useLevels();
  const nextLevel = Object.entries(levels).find(([, level]) => !level.completed)?.[0];

  return <Redirect href={`/level/${nextLevel}`} />;
};

const App = () => {
  return (
    <div className="h-full p-4 col">
      <Route path="/">
        <RedirectToNextLevel />
      </Route>

      <Route path="/levels">
        <Levels />
      </Route>

      <Route path="/level/:levelId">{(params) => <Game levelId={params.levelId} />}</Route>
    </div>
  );
};

export default App;

import { Redirect, Route, Router } from 'wouter';

import { GameView } from './views/game-view';
import { LevelsView } from './views/levels-view';
import { useLevels } from './use-levels';

const RedirectToNextLevel = () => {
  const { levels } = useLevels();
  const nextLevel = Object.entries(levels).find(([, level]) => !level?.completed)?.[0];

  return <Redirect href={`/level/${nextLevel}`} />;
};

const App = () => {
  return (
    <div className="h-full p-4 col">
      <Router base={import.meta.env.VITE_APP_BASE_URL}>
        <Route path="/">
          <RedirectToNextLevel />
        </Route>

        <Route path="/levels">
          <LevelsView />
        </Route>

        <Route path="/level/:levelId">{(params) => <GameView levelId={params.levelId} />}</Route>
      </Router>
    </div>
  );
};

export default App;

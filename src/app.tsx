import { Redirect, Route, Router, Switch } from 'wouter';

import { useLevels } from './use-levels';
import { GameView } from './views/game-view';
import { LevelsListView } from './views/levels-list';
import { LevelsView } from './views/levels-view';

const RedirectToNextLevel = () => {
  const { levels } = useLevels();
  const nextLevel = Object.entries(levels).find(([, level]) => !level?.completed)?.[0];

  return <Redirect href={`/level/${nextLevel}`} />;
};

export const App = () => (
  <>
    <Router base={import.meta.env.VITE_APP_BASE_URL}>
      <Route path="/">
        <RedirectToNextLevel />
      </Route>

      <DesktopRoutes />
      <MobileRoutes />
    </Router>
  </>
);

const DesktopRoutes = () => (
  <Switch>
    <Route path="/levels-list">
      <LevelsListView />
    </Route>
  </Switch>
);

const MobileRoutes = () => (
  <Switch>
    <Route path="/levels">
      <LevelsView />
    </Route>

    <Route path="/level/:levelId">{(params) => <GameView levelId={params.levelId} />}</Route>
  </Switch>
);

import { Redirect, Route, Router, Switch } from 'wouter';
import Helmet from 'react-helmet';

import { GameView } from './views/game-view';
import { AdminView } from './views/admin-view';
import { LevelsView } from './views/levels-view';
import { NotFoundView } from './views/not-found-view';
import { LevelsProvider, useLevels } from './game/levels-context';

export const App = () => (
  <LevelsProvider>
    <Helmet>
      <title>Deadlock</title>
    </Helmet>

    <Router base={import.meta.env.VITE_APP_BASE_URL}>
      <Switch>
        <Route path="/">
          <RedirectToNextLevel />
        </Route>

        <Route path="/admin">
          <AdminView />
        </Route>

        <Route path="/levels">
          <LevelsView />
        </Route>

        <Route<{ levelId: string }> path="/level/:levelId">
          {(params) => <GameView levelId={params.levelId} />}
        </Route>

        <Route>
          <NotFoundView />
        </Route>
      </Switch>
    </Router>
  </LevelsProvider>
);

const RedirectToNextLevel = () => {
  const levels = useLevels();
  const nextLevel = Object.entries(levels).find(([, level]) => !level?.completed)?.[0];

  return <Redirect href={`/level/${nextLevel}`} />;
};

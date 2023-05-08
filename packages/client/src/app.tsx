import { Redirect, Route, Router, Switch } from 'wouter';
import Helmet from 'react-helmet';

import { GameView } from './views/game-view';
import { AdminView } from './views/admin-view';
import { LevelsView } from './views/levels-view';
import { NotFoundView } from './views/not-found-view';
import { LevelsProvider, useLevels, useLevelsIds } from './game/levels-context';
import { TestView } from './views/test-view';
import { useNavigate } from './hooks/use-navigate';
import { useEffect } from 'react';

export const App = () => (
  <LevelsProvider>
    <Helmet>
      <title>Deadlock</title>
    </Helmet>

    <GoToFirstLevel />

    <Router>
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

        <Route path="/test">
          <TestView />
        </Route>

        <Route>
          <NotFoundView />
        </Route>
      </Switch>
    </Router>
  </LevelsProvider>
);

const GoToFirstLevel = () => {
  const navigate = useNavigate();
  const levels = useLevelsIds();

  useEffect(() => {
    window.addEventListener('keydown', (event) => {
      if (event.key === 'F4') {
        navigate(`/level/${levels[0]}`);
      }
    });
  }, [levels, navigate]);

  return null;
};

const RedirectToNextLevel = () => {
  const levels = useLevels();
  const nextLevel = Object.entries(levels).find(([, level]) => !level?.completed)?.[0];

  return <Redirect replace href={`/level/${nextLevel}`} />;
};

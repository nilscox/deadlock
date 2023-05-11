import { Helmet } from 'react-helmet';
import { Redirect, Route, Router, Switch } from 'wouter';

import { useEffect } from 'react';
import { LevelsProvider, useLevels, useLevelsIds } from './game/levels-context';
import { useNavigate } from './hooks/use-navigate';
import { AdminView } from './views/admin-view';
import { GameView } from './views/game-view';
import { LevelsView } from './views/levels-view';
import { NotFoundView } from './views/not-found-view';
import { TestView } from './views/test-view';

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
          {(params) => <GameViewUnsafe levelId={params.levelId} />}
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

  if (!nextLevel) {
    return <Redirect replace href="/levels" />;
  }

  return <Redirect replace href={`/level/${nextLevel}`} />;
};

type GameViewUnsafeProps = {
  levelId: string;
};

const GameViewUnsafe = ({ levelId }: GameViewUnsafeProps) => {
  const levels = useLevels();
  const navigate = useNavigate();

  useEffect(() => {
    if (!levels[levelId]) {
      navigate('/levels', { replace: true });
    }
  }, [levels, levelId, navigate]);

  if (!levels[levelId]) {
    return null;
  }

  return <GameView levelId={levelId} />;
};

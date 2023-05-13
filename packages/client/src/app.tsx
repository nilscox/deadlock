import { useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Redirect, Route, Router, Switch } from 'wouter';

import { useLevelExists, useLevelsIds, useLevelsMatching } from './game/levels-context';
import { useNavigate } from './hooks/use-navigate';
import { AdminView } from './views/admin-view';
import { GameView } from './views/game-view';
import { LevelsView } from './views/levels-view';
import { NotFoundView } from './views/not-found-view';
import { TestView } from './views/test-view';
import { LevelEditorView } from './views/level-editor-view';

export const App = () => (
  <>
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

        <Route path="/level-editor">
          <LevelEditorView />
        </Route>

        <Route path="/test">
          <TestView />
        </Route>

        <Route>
          <NotFoundView />
        </Route>
      </Switch>
    </Router>
  </>
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
  const [nextLevelId] = useLevelsMatching(useCallback((level, userData) => !userData?.completed, []));

  if (!nextLevelId) {
    return <Redirect replace href="/levels" />;
  }

  return <Redirect replace href={`/level/${nextLevelId}`} />;
};

type GameViewUnsafeProps = {
  levelId: string;
};

const GameViewUnsafe = ({ levelId }: GameViewUnsafeProps) => {
  const exists = useLevelExists(levelId);
  const navigate = useNavigate();

  useEffect(() => {
    if (!exists) {
      navigate('/levels', { replace: true });
    }
  }, [exists, levelId, navigate]);

  if (!exists) {
    return null;
  }

  return <GameView levelId={levelId} />;
};

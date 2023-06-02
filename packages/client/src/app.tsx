import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Route, Router, Switch } from 'wouter';

import { AdminView } from './admin/admin-view';
import { useTranslation } from './components/translate';
import { useLevel, useLevelsIds } from './game/levels-context';
import { useNavigate } from './hooks/use-navigate';
import { GameView } from './views/game-view';
import { HomeView } from './views/home-view';
import { LabLevels } from './views/lab-level';
import { LabView } from './views/lab-view';
import { LevelEditorView } from './views/level-editor-view';
import { LevelsView } from './views/levels-view';
import { NotFoundView } from './views/not-found-view';
import { OptionsView } from './views/options-view';
import { TestView } from './views/test-view';

export const App = () => (
  <>
    <Helmet>
      <title>{useTranslation()('meta.title')}</title>
    </Helmet>

    <GoToFirstLevel />

    <Router>
      <Switch>
        <Route path="/">
          <HomeView />
        </Route>

        <Route path="/admin/:all*">
          <AdminView />
        </Route>

        <Route path="/levels">
          <LevelsView />
        </Route>

        <Route<{ levelId: string }> path="/level/:levelId">
          {(params) => <GameViewUnsafe levelId={params.levelId} />}
        </Route>

        <Route path="/options">
          <OptionsView />
        </Route>

        <Route path="/lab">
          <LabView />
        </Route>

        <Route path="/lab/level">
          <LabLevels />
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

type GameViewUnsafeProps = {
  levelId: string;
};

const GameViewUnsafe = ({ levelId }: GameViewUnsafeProps) => {
  const level = useLevel(levelId);
  const navigate = useNavigate();

  useEffect(() => {
    if (!level) {
      navigate('/levels', { replace: true });
    }
  }, [level, levelId, navigate]);

  if (!level) {
    return null;
  }

  return <GameView levelId={levelId} />;
};

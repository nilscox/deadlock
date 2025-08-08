import { useEffect } from 'react';
import { Route, Switch } from 'wouter';

import { GamePage } from './game/game.page';
import { HomePage } from './home/home.page';
import { createTranslate } from './intl';
import { LevelsPage } from './levels/levels.page';
import { SettingsPage } from './settings/settings.page';

const T = createTranslate();

export function App() {
  const t = T.useTranslate();

  useEffect(() => {
    document.title = t('meta.title');
  }, [t]);

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/levels" component={LevelsPage} />
      <Route path="/levels/:levelId" component={GamePage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={PageNotFound} />
    </Switch>
  );
}

function PageNotFound() {
  return <T id="notFound.title" />;
}

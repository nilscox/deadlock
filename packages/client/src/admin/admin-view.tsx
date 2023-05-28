import { Redirect, Route, Switch } from 'wouter';

import { Tabs, Tab } from '~/components/tabs';

import { LevelsTab } from './tabs/levels/levels-tab';
import { SessionsTab } from './tabs/sessions/sessions-tab';

export const AdminView = () => (
  <div className="h-full col">
    <Tabs>
      <Tab href="/levels">Levels</Tab>
      <Tab href="/sessions">Sessions</Tab>
    </Tabs>

    <div className="p-4 flex-1 overflow-hidden">
      <Switch>
        <Route path="/levels">
          <LevelsTab />
        </Route>

        <Route path="/sessions">
          <SessionsTab />
        </Route>

        <Route>
          <Redirect href="/levels" />
        </Route>
      </Switch>
    </div>
  </div>
);

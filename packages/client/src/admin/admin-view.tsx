import { Redirect, Route, Switch } from 'wouter';

import { Tabs, Tab } from '~/components/tabs';

import { LevelsTab } from './tabs/levels/levels-tab';
import { SessionsTab } from './tabs/sessions/sessions-tab';

export const AdminView = () => (
  <div className="h-full col">
    <Tabs>
      <Tab href="/admin/levels">Levels</Tab>
      <Tab href="/admin/sessions">Sessions</Tab>
    </Tabs>

    <div className="p-4 flex-1 overflow-hidden">
      <Switch>
        <Route path="/admin/levels">
          <LevelsTab />
        </Route>

        <Route path="/admin/sessions">
          <SessionsTab />
        </Route>

        <Route>
          <Redirect href="/admin/levels" />
        </Route>
      </Switch>
    </div>
  </div>
);

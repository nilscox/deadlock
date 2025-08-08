import type { LevelData } from '@deadlock/game';
import { createContext, use, useState } from 'react';

import { api } from './api';
import { IntlProvider } from './intl';

export type LevelUserData = {
  completed: boolean;
  tries: number;
  time: number;
};

export const LevelsContext = createContext<LevelData[]>([]);

export const UserDataContext = createContext<{
  data: Record<string, LevelUserData>;
  setData: (data: Record<string, LevelUserData>) => void;
}>(null as never);

const levelsPromise = api.getLevels();

export function Providers({ children }: { children: React.ReactNode }) {
  const levels = use(levelsPromise);

  const [data, setDataState] = useState<Record<string, LevelUserData>>(
    JSON.parse(localStorage.getItem('levels') ?? '{}') as Record<string, LevelUserData>,
  );

  const setData = (data: Record<string, LevelUserData>) => {
    localStorage.setItem('levels', JSON.stringify(data));
    setDataState(data);
  };

  return (
    <IntlProvider>
      <LevelsContext value={levels}>
        <UserDataContext value={{ data, setData }}>{children}</UserDataContext>
      </LevelsContext>
    </IntlProvider>
  );
}

import { Emitter } from '@deadlock/game';
import { useCallback, useEffect, useState } from 'react';

export type LevelUserData = {
  completed: boolean;
  tries: number;
  time: number;
};

type UserData = Record<string, LevelUserData>;

enum UserDataEvent {
  changed = 'changed',
}

type UserDataEventsMap = {
  [UserDataEvent.changed]: UserData;
};

const userDataEmitter = new Emitter<UserDataEvent, UserDataEventsMap>();

let globalUserData = JSON.parse(localStorage.getItem('levels') ?? '{}') as UserData;

export const useUserData = () => {
  const [data, setData] = useState<UserData>(globalUserData);

  useEffect(() => {
    return userDataEmitter.addListener(UserDataEvent.changed, setData);
  }, []);

  return data;
};

export const useLevelUserData = (levelId: string): LevelUserData | undefined => {
  const data = useUserData();
  return data[levelId];
};

export const useSaveUserData = () => {
  return useCallback((data: UserData) => {
    globalUserData = data;
    localStorage.setItem('levels', JSON.stringify(data));
    userDataEmitter.emit(UserDataEvent.changed, data);
  }, []);
};

export const useSaveLevelUserData = () => {
  const data = useUserData();
  const saveUserData = useSaveUserData();

  return useCallback(
    (levelId: string, level: LevelUserData) => {
      saveUserData({ ...data, [levelId]: level });
    },
    [data, saveUserData]
  );
};

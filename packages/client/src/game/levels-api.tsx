import { LevelDefinition } from '@deadlock/game';
import { defined } from '@deadlock/game/src/utils/assert';
import { QueryFunction, useMutation, useQuery } from '@tanstack/react-query';

import { getConfig } from '../hooks/use-config';

const getLevels: QueryFunction<Record<string, LevelDefinition>> = async () => {
  const { serverUrl } = getConfig();
  const response = await fetch(`${serverUrl}/levels`);

  return response.json();
};

export const useLevels = () => {
  const { data } = useQuery({ queryKey: ['levels'], queryFn: getLevels });
  return defined(data);
};

type LevelSession = {
  levelId: string;
  completed: boolean;
  tries: number;
  time: number;
};

const postLevelSession = async (session: LevelSession) => {
  const { serverUrl } = getConfig();

  await fetch(`${serverUrl}/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session),
  });
};

export const usePostLevelSession = () => {
  const { mutate } = useMutation({ mutationFn: postLevelSession });
  return mutate;
};

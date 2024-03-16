import { LevelData, toObject } from '@deadlock/game';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';

import { useSearchParams } from '~/hooks/use-search-params';

import { api } from '../api';

export const useLevels = () => {
  const params = useSearchParams();
  const unvalidated = params.has('unvalidated');

  const { data } = useSuspenseQuery({
    queryKey: ['levels', unvalidated],
    queryFn: async () => {
      const levels = await api.get<LevelData[]>(unvalidated ? '/levels/unvalidated' : '/levels');

      return toObject(
        levels,
        ({ id }) => id,
        (level) => level
      );
    },
  });

  return data;
};

type LevelSession = {
  levelId: string;
  completed: boolean;
  tries: number;
  time: number;
};

export const usePostLevelSession = () => {
  const { mutate } = useMutation({
    mutationFn: (session: LevelSession) => api.post('/session', session),
  });

  return mutate;
};

import { LevelData, toObject } from '@deadlock/game';
import { defined } from '@deadlock/game/src/utils/assert';
import { useMutation, useQuery } from '@tanstack/react-query';

import { useSearchParam } from '~/hooks/use-search-params';

import { api } from '../api';

export const useLevels = () => {
  const [unvalidatedParam] = useSearchParam('unvalidated');
  const unvalidated = unvalidatedParam !== 'undefined';

  const { data } = useQuery({
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

  return defined(data);
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

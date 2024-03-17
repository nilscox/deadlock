import { Game, LevelData, LevelEvent, toObject } from '@deadlock/game';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

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

type SessionData = {
  time: number;
  completed: boolean;
};

export const useTrackSession = (levelId: string, game?: Game) => {
  const { data: sessionId, mutate: createSession } = useMutation({
    mutationKey: ['createSession', levelId],
    mutationFn: (data: SessionData) => api.post('/session', { levelId, ...data }) as Promise<string>,
  });

  const { mutate: updateSession } = useMutation({
    mutationFn: (data: SessionData) => api.put(`/session/${sessionId as string}`, data),
  });

  useEffect(() => {
    if (!game) {
      return;
    }

    const handler = (completed: boolean) => {
      const data: SessionData = {
        time: game.stopwatch.elapsed,
        completed,
      };

      if (sessionId) {
        updateSession(data);
      } else {
        createSession(data);
      }

      game.stopwatch.restart();
    };

    const onRestarted = handler.bind(null, false);
    const onCompleted = handler.bind(null, true);

    game.level.addListener(LevelEvent.restarted, onRestarted);
    game.level.addListener(LevelEvent.completed, onCompleted);

    return () => {
      game.level.removeListener(LevelEvent.restarted, onRestarted);
      game.level.removeListener(LevelEvent.completed, onCompleted);
    };
  }, [game, sessionId, createSession, updateSession]);
};

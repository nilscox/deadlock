import IconSort from '@heroicons/react/24/solid/ArrowsUpDownIcon';
import IconUnvalidate from '@heroicons/react/24/solid/EyeSlashIcon';
import IconEdit from '@heroicons/react/24/solid/PencilIcon';
import IconPlay from '@heroicons/react/24/solid/PlayIcon';
import IconDelete from '@heroicons/react/24/solid/XMarkIcon';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { api } from '~/api';
import { Link } from '~/components/link';
import { useLevelDefinition } from '~/game/levels-context';
import { toSearchParams } from '~/hooks/use-search-params';

type ActionsProps = {
  levelId: string;
};

export const Actions = ({ levelId }: ActionsProps) => {
  const definition = useLevelDefinition(levelId);
  const setLevelNumber = useSetLevelNumber(levelId);
  const deleteLevel = useDeleteLevel(levelId);

  const handleSetLevelNumber = () => {
    const input = window.prompt('Position:');

    if (!input) {
      return;
    }

    const value = Number.parseInt(input);

    if (Number.isNaN(value)) {
      alert('Invalid value');
      return;
    }

    setLevelNumber(value);
  };

  const handleUnvalidate = () => {
    if (!window.confirm(`Level ${levelId} will be unvalidated. Continue?`)) {
      return;
    }

    setLevelNumber(null);
  };

  const handleDeleteLevel = () => {
    if (!window.confirm(`Level ${levelId} will be (soft) deleted. Continue?`)) {
      deleteLevel();
    }
  };

  return (
    <ul className="row gap-6 text-muted items-center">
      <li title="Test level">
        <Link href={`/test?${toSearchParams({ levelId, definition: JSON.stringify(definition) })}`}>
          <IconPlay className="h-5 w-5" />
        </Link>
      </li>

      <li title="Edit level">
        <Link href={`/level-editor?${toSearchParams({ levelId, definition: JSON.stringify(definition) })}`}>
          <IconEdit className="h-5 w-5" />
        </Link>
      </li>

      <li title="Change level position">
        <button onClick={handleSetLevelNumber}>
          <IconSort className="h-5 w-5" />
        </button>
      </li>

      <li title="Unvalidate level">
        <button onClick={handleUnvalidate}>
          <IconUnvalidate className="h-5 w-5" />
        </button>
      </li>

      <li title="Delete level">
        <button onClick={handleDeleteLevel}>
          <IconDelete className="h-5 w-5 text-red" />
        </button>
      </li>
    </ul>
  );
};

const useSetLevelNumber = (levelId: string) => {
  const refetchLevels = useRefetchLevels();

  const { mutate } = useMutation({
    onSuccess: refetchLevels,
    mutationFn: (levelNumber: number | null) => api.patch(`/level/${levelId}`, { position: levelNumber }),
  });

  return mutate;
};

const useDeleteLevel = (levelId: string) => {
  const refetchLevels = useRefetchLevels();

  const { mutate } = useMutation({
    onSuccess: refetchLevels,
    mutationFn: () => api.delete(`/level/${levelId}`),
  });

  return mutate;
};

const useRefetchLevels = () => {
  const queryClient = useQueryClient();

  return useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['levels'] });
  }, [queryClient]);
};

import {
  Game as GameClass,
  Level,
  LevelData,
  LevelEvent,
  LevelFlag,
  defined,
  toObject,
} from '@deadlock/game';
import { useMutation, useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { useCallback, useEffect, useState } from 'react';
import { Redirect } from 'wouter';

import { api } from '~/api';
import { Link } from '~/components/link';
import { Game } from '~/game/game';
import { useIsLevelCompleted, useOnSessionTerminated } from '~/game/levels-context';
import { useUserData } from '~/game/levels-user-data';
import { useBoolean } from '~/hooks/use-boolean';
import { useNavigate } from '~/hooks/use-navigate';
import { MobileView } from '~/mobile-view';

export const LabLevels = () => {
  const userData = useUserData();
  const levels = useUnvalidatedLevels();

  const [levelId, setLevelId] = useState(() => {
    return Object.keys(levels).find((levelId) => userData[levelId]?.completed !== true);
  });

  const onNext = () => {
    const nextLevelId = Object.keys(levels).find((levelId) => userData[levelId]?.completed !== true);
    setLevelId(nextLevelId);
  };

  if (!levelId) {
    return <Redirect href="/lab" />;
  }

  return <LabLevel level={levels[levelId]} onNext={onNext} />;
};

type LabLevelProps = {
  level: LevelData;
  onNext: () => void;
};

const LabLevel = ({ level, onNext }: LabLevelProps) => {
  const navigate = useNavigate();

  const definition = level.definition;
  const completed = useIsLevelCompleted(level.id);

  const onSessionTerminated = useOnSessionTerminated(level.id);

  const [game, setGame] = useState<GameClass>();

  const [feedbackModalOpen, openFeedbackModal, closeFeedbackModal] = useBoolean(false);

  const onCompleted = useCallback(() => {
    onSessionTerminated(defined(game), true);
    setTimeout(openFeedbackModal, 1000);
  }, [game, onSessionTerminated, openFeedbackModal]);

  const handleNext = () => {
    closeFeedbackModal();
    onNext();
  };

  useEffect(() => {
    if (!game) {
      return;
    }

    game.level.addListener(LevelEvent.completed, onCompleted);
    return () => game.level.removeListener(LevelEvent.completed, onCompleted);
  }, [game, onCompleted]);

  useEffect(() => {
    if (!game) {
      return;
    }

    const emitter = game.level.cloneEmitter();

    emitter.addListener(LevelEvent.loaded, () => game.enableControls());
    emitter.addListener(LevelEvent.completed, () => game.disableControls());

    return () => emitter.removeListeners();
  }, [game]);

  return (
    <MobileView>
      <div className="row items-end justify-between">
        <Link href="/lab" className="row gap-2 items-center">
          <div className="text-muted flip-horizontal">➜</div> Back
        </Link>
      </div>

      <div className="flex-1 col justify-center text-center">
        <div
          className={clsx('transition-colors text-xl font-semibold', completed && 'text-green')}
          onDoubleClick={() => navigate(`/level-editor?hash=${new Level(definition).hash}`)}
        >
          Test Level
        </div>
        <div className="text-muted">{level.id}</div>
      </div>

      <Game definition={definition} onLoaded={setGame} className="mx-auto" />

      <div className="flex-1"></div>

      <FeedbackModal levelId={level.id} open={feedbackModalOpen} onNext={handleNext} />
    </MobileView>
  );
};

const useUnvalidatedLevels = () => {
  const { data } = useQuery({
    queryKey: ['levels', 'unvalidated'],
    queryFn: async () => {
      const levels = await api.get<LevelData[]>('/levels/unvalidated');

      return toObject(
        levels,
        ({ id }) => id,
        (level) => level
      );
    },
  });

  return defined(data);
};

type FeedbackModalProps = {
  levelId: string;
  open: boolean;
  onNext: () => void;
};

const FeedbackModal = ({ levelId, open, onNext }: FeedbackModalProps) => {
  const { mutate: flagLevel } = useMutation({
    mutationFn: (flag: LevelFlag) => api.post(`/level/${levelId}/flag`, { flag }),
  });

  const [ref, setRef] = useState<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (open && !ref?.open) {
      ref?.showModal();
    } else {
      ref?.close();
      setDifficulty(undefined);
      setAddIt(undefined);
    }
  }, [open, ref]);

  const [difficulty, setDifficulty] = useState<LevelFlag.easy | LevelFlag.hard>();
  const [addIt, setAddIt] = useState<boolean>();

  const handleSubmit: React.FormEventHandler = (event) => {
    event.preventDefault();

    if (difficulty !== undefined) {
      flagLevel(difficulty);
    }

    if (addIt === true) {
      flagLevel(LevelFlag.cool);
    }

    onNext();
  };

  return (
    <dialog ref={setRef} className="border rounded-lg w-full max-w-md shadow-lg">
      <h2 className="text-lg mb-8">Congrats!</h2>

      <form className="col gap-8" onSubmit={handleSubmit}>
        <div className="col gap-4">
          <p>How was this level?</p>

          <ButtonsGroup>
            <GroupButton
              selected={difficulty === LevelFlag.easy}
              onClick={() => setDifficulty(LevelFlag.easy)}
            >
              Easy
            </GroupButton>

            <GroupButton selected={difficulty === undefined} onClick={() => setDifficulty(undefined)}>
              Neither
            </GroupButton>

            <GroupButton
              selected={difficulty === LevelFlag.hard}
              onClick={() => setDifficulty(LevelFlag.hard)}
            >
              Hard
            </GroupButton>
          </ButtonsGroup>
        </div>

        <div className="col gap-4">
          <p>Should we add it to the game?</p>

          <ButtonsGroup>
            <GroupButton selected={addIt === false} onClick={() => setAddIt(false)}>
              No
            </GroupButton>

            <GroupButton selected={addIt === undefined} onClick={() => setAddIt(undefined)}>
              No opinion
            </GroupButton>

            <GroupButton selected={addIt === true} onClick={() => setAddIt(true)}>
              Yes
            </GroupButton>
          </ButtonsGroup>
        </div>

        <button type="submit" className="self-end row items-center gap-2">
          Next level <div className="text-muted">➜</div>
        </button>
      </form>
    </dialog>
  );
};

type ButtonsGroupProps = {
  children: React.ReactNode;
};

const ButtonsGroup = ({ children }: ButtonsGroupProps) => (
  <div className="row border divide-x self-center rounded">{children}</div>
);

type GroupButtonProps = {
  className?: string;
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
};

const GroupButton = ({ className, selected, onClick, children }: GroupButtonProps) => (
  <button type="button" className={clsx('px-4 py-2', selected && 'bg-muted', className)} onClick={onClick}>
    {children}
  </button>
);

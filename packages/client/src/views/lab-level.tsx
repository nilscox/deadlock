import {
  Game as GameClass,
  Level,
  LevelData,
  LevelEvent,
  LevelFlag,
  defined,
  randItem,
  toObject,
} from '@deadlock/game';
import { useMutation, useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Redirect } from 'wouter';

import { api } from '~/api';
import { ArrowLeft, ArrowRight } from '~/components/arrows';
import { Link } from '~/components/link';
import { Translate } from '~/components/translate';
import { Game } from '~/game/game';
import { useIsLevelCompleted, useOnSessionTerminated } from '~/game/levels-context';
import { useUserData } from '~/game/levels-user-data';
import { useBoolean } from '~/hooks/use-boolean';
import { useNavigate } from '~/hooks/use-navigate';
import { MobileNavigation, MobileView } from '~/mobile-view';

const T = Translate.prefix('views.labLevel');

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
    <MobileView
      header={
        <MobileNavigation
          left={
            <Link href="/lab" className="row gap-2 items-center">
              <ArrowLeft />
              <Translate id="navigation.lab" />
            </Link>
          }
        />
      }
    >
      <div className="flex-1 col justify-center text-center">
        <div
          className={clsx('transition-colors text-xl font-semibold', completed && 'text-green')}
          onDoubleClick={() => navigate(`/level-editor?hash=${new Level(definition).hash}`)}
        >
          <T id="title" />
        </div>
        <div className="text-muted">{level.id}</div>
      </div>

      <div className="flex-3">
        <Game definition={definition} onLoaded={setGame} className="mx-auto" />
      </div>

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
  const [submitted, onSubmitted, resetSubmitted] = useBoolean(false);

  useEffect(() => {
    resetSubmitted();
  }, [levelId]);

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

    onSubmitted();
    setTimeout(() => onNext(), 1500);
  };

  const emoji = useMemo(() => randItem(emojis), [levelId]);

  return (
    <dialog ref={setRef} className="px-4 min-w-full bg-transparent">
      <div className="mx-auto border rounded-lg w-full max-w-md shadow-lg bg-body p-4">
        <h2 className="text-lg mb-8">
          <T id="feedbackDialog.title" />
        </h2>

        <form className={clsx('col gap-8', submitted && '!hidden')} onSubmit={handleSubmit}>
          <div className="col gap-4">
            <p>
              <T id="feedbackDialog.difficultyQuestion" />
            </p>

            <ButtonsGroup>
              <GroupButton
                selected={difficulty === LevelFlag.easy}
                onClick={() => setDifficulty(LevelFlag.easy)}
              >
                <T id="feedbackDialog.easy" />
              </GroupButton>

              <GroupButton selected={difficulty === undefined} onClick={() => setDifficulty(undefined)}>
                <T id="feedbackDialog.neither" />
              </GroupButton>

              <GroupButton
                selected={difficulty === LevelFlag.hard}
                onClick={() => setDifficulty(LevelFlag.hard)}
              >
                <T id="feedbackDialog.hard" />
              </GroupButton>
            </ButtonsGroup>
          </div>

          <div className="col gap-4">
            <p>
              <T id="feedbackDialog.validateQuestion" />
            </p>

            <ButtonsGroup>
              <GroupButton selected={addIt === false} onClick={() => setAddIt(false)}>
                <T id="feedbackDialog.no" />
              </GroupButton>

              <GroupButton selected={addIt === undefined} onClick={() => setAddIt(undefined)}>
                <T id="feedbackDialog.noOpinion" />
              </GroupButton>

              <GroupButton selected={addIt === true} onClick={() => setAddIt(true)}>
                <T id="feedbackDialog.yes" />
              </GroupButton>
            </ButtonsGroup>
          </div>

          <button type="submit" className="self-end row items-center gap-2">
            <T id="feedbackDialog.nextLevel" />
            <ArrowRight />
          </button>
        </form>

        <div className={clsx('text-lg', !submitted && 'hidden')}>
          <T id="feedbackDialog.thanks" /> {emoji}
        </div>
      </div>
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

const emojis = [
  '😀',
  '😉',
  '😊',
  '😁',
  '😚',
  '🤗',
  '🤗',
  '☺️',
  '😎',
  '🥳',
  '😸',
  '😺',
  '🙌',
  '❤️',
  '🎉',
  '💪',
  '👌',
  '👍',
  '✌️',
  '🖖',
  '🤘',
  '👏',
  '✅',
  '🔥',
  '✨',
  '🌟',
  '💯',
  '💥',
  '💃',
  '🕺',
  '🦸',
];

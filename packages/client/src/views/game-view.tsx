import { Game as GameClass, Level, LevelEvent, assert } from '@deadlock/game';
import { clsx } from 'clsx';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import { ArrowLeft, ArrowRight } from '~/components/arrows';
import { Link } from '~/components/link';
import { Translate } from '~/components/translate';
import { Game } from '~/game/game';
import {
  useIsLevelCompleted,
  useLevelDefinition,
  useLevelNumber,
  useLevelsIds,
  useOnSessionTerminated,
} from '~/game/levels-context';
import { useNavigate } from '~/hooks/use-navigate';
import { MobileNavigation, MobileView } from '~/mobile-view';

const T = Translate.prefix('views.game');

type GameViewProps = {
  levelId: string;
};

export const GameView = ({ levelId }: GameViewProps) => {
  const navigate = useNavigate();

  const levelNumber = useLevelNumber(levelId);
  const definition = useLevelDefinition(levelId);
  const completed = useIsLevelCompleted(levelId);

  const onSessionTerminated = useOnSessionTerminated(levelId);
  const prevLevel = useGoToPrevLevel(levelId);
  const nextLevel = useGoToNextLevel(levelId);

  const [game, setGame] = useState<GameClass>();

  const onCompleted = useCallback(() => {
    assert(game);
    onSessionTerminated(game, true);
    setTimeout(nextLevel, 1000);
  }, [game, onSessionTerminated, nextLevel]);

  const onSkip = useCallback(() => {
    assert(game);
    onSessionTerminated(game, false);
    nextLevel();
  }, [game, onSessionTerminated, nextLevel]);

  useEffect(() => {
    if (!game) {
      return;
    }

    game.level.addListener(LevelEvent.completed, onCompleted);

    return () => {
      game.level.removeListener(LevelEvent.completed, onCompleted);
    };
  }, [game, onCompleted]);

  useEffect(() => {
    if (!game) {
      return;
    }

    const emitter = game.level.cloneEmitter();

    emitter.addListener(LevelEvent.loaded, () => game.enableControls());
    emitter.addListener(LevelEvent.completed, () => game.disableControls());

    return () => {
      emitter.removeListeners();
    };
  }, [game]);

  return (
    <MobileView
      header={
        <MobileNavigation
          left={
            <button onClick={prevLevel} className="row gap-2 items-center">
              <ArrowLeft />
              <T id="navigation.prev" />
            </button>
          }
          center={
            <Link href="/levels" onClick={onSkip} className="row gap-2 items-center">
              <T id="navigation.levels" />
            </Link>
          }
          right={
            <button onClick={onSkip} className="row gap-2 items-center">
              <T id="navigation.skip" />
              <ArrowRight />
            </button>
          }
        />
      }
    >
      <Helmet>
        <title>{`Deadlock - Level ${levelNumber ?? '?'}`}</title>
      </Helmet>

      <div className="flex-1 col justify-center text-center">
        <div
          className={clsx('transition-colors text-xl font-semibold', completed && 'text-green')}
          onDoubleClick={() => navigate(`/level-editor?hash=${new Level(definition).hash}`)}
        >
          <T id="levelNumber" values={{ levelNumber: Number(levelNumber) }} />
        </div>
        <div className="text-muted">{levelId}</div>
      </div>

      <Game definition={definition} onLoaded={setGame} className="mx-auto" />

      <div className="flex-1">
        <Help game={game} levelNumber={levelNumber} />
      </div>
    </MobileView>
  );
};

type HelpProps = {
  game: GameClass | undefined;
  levelNumber?: number;
};

const Help = ({ game, levelNumber }: HelpProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(false);
  }, [levelNumber]);

  useEffect(() => {
    const timeout = setTimeout(() => setShow(true), 4000);
    return () => clearTimeout(timeout);
  }, [levelNumber]);

  const [restarted, setRestarted] = useState(false);

  useEffect(() => {
    const onRestarted = () => setRestarted(true);

    game?.level.addListener(LevelEvent.restarted, onRestarted);
    return () => game?.level.removeListener(LevelEvent.restarted, onRestarted);
  }, [game]);

  if (!show) {
    return null;
  }

  if (Number(levelNumber) === 1) {
    return <HelpSwipe />;
  }

  if (Number(levelNumber) <= 7 && !restarted) {
    return <HelpRestart />;
  }

  return null;
};

const HelpSwipe = () => (
  <div className="animate-fade-in col gap-4 justify-center items-center text-muted">
    <svg className="w-[6rem] animate-swipe" viewBox="0 0 10 4" stroke="currentColor">
      <line x1="1" x2="9" y1="2" y2="2" strokeWidth="1" strokeLinecap="round" />
      <path d="M 7.5 1 L 9 2 L 7.5 3 Z" strokeLinejoin="round" fill="currentColor" />
    </svg>
    <div className="text-lg text-center">
      <T id="help.swipe" />
    </div>
  </div>
);

const HelpRestart = () => (
  <div className="animate-fade-in col gap-4 justify-center items-center text-muted">
    <svg className="w-[2rem] animate-tap-twice" viewBox="0 0 4 4" fill="currentColor">
      <circle cx="2" cy="2" r="1.75" />
    </svg>
    <div className="text-lg text-center">
      <T id="help.tapTwice" />
    </div>
  </div>
);

const useGoToPrevLevel = (levelId: string) => {
  const navigate = useNavigate();
  const levelsIds = useLevelsIds();
  const prevLevelId = levelsIds[levelsIds.indexOf(levelId) - 1];

  return useCallback(() => {
    if (prevLevelId) {
      navigate(`/level/${prevLevelId}`);
    } else {
      navigate('/levels');
    }
  }, [prevLevelId, navigate]);
};

const useGoToNextLevel = (levelId: string) => {
  const navigate = useNavigate();
  const levelsIds = useLevelsIds();
  const nextLevelId = levelsIds[levelsIds.indexOf(levelId) + 1];

  return useCallback(() => {
    if (nextLevelId) {
      navigate(`/level/${nextLevelId}`);
    } else {
      navigate('/levels');
    }
  }, [nextLevelId, navigate]);
};

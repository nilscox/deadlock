import { assert } from '@deadlock/game';
import { Stopwatch } from '@deadlock/game/src/stopwatch';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { use, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'wouter';

import { api } from '../api';
import { AppHeader } from '../app-header';
import { LevelsContext, UserDataContext } from '../contexts';
import { createTranslate } from '../intl';

import { GameRenderer } from './game-renderer';
import { Tutorial } from './tutorial';

const T = createTranslate('game');

export function GamePage() {
  const { levelId } = useParams<{ levelId: string }>();
  const [, navigate] = useLocation();

  const levels = use(LevelsContext);
  const levelIndex = levels.findIndex((level) => level.id === levelId);
  const level = levels[levelIndex];

  assert(level);

  const { data } = use(UserDataContext);
  const completed = data[levelId]?.completed;

  const reporting = useReporting(levelId);

  const [renderer, setRenderer] = useState(new GameRenderer(level.definition));
  const gameContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameContainer.current) {
      return;
    }

    const renderer = new GameRenderer(level.definition);

    setRenderer(renderer);
    renderer.appendTo(gameContainer.current);

    reporting.onLoaded();
    renderer.level.addListener('loaded', reporting.onLoaded);
    renderer.level.addListener('restarted', reporting.onRestarted);
    renderer.level.addListener('completed', reporting.onCompleted);
    renderer.player.addListener('moved', reporting.onMoved);

    renderer.level.addListener('completed', () => {
      setTimeout(() => navigate(nextLevelLink ?? '/'), 750);
    });

    return () => {
      renderer.cleanup();
      gameContainer.current?.removeChild(renderer.domElement);
    };
  }, [level]);

  const nextLevel = levels[levelIndex + 1];
  const nextLevelLink = nextLevel ? `/levels/${nextLevel.id}` : null;

  return (
    <>
      <AppHeader
        left={
          <Link href="/levels">
            <ArrowLeft />
            <T id="levels" />
          </Link>
        }
        center={
          <div style={{ color: completed ? 'green' : undefined }}>
            <T id="levelNumber" values={{ levelNumber: level.number }} />
          </div>
        }
        right={
          nextLevelLink && (
            <Link href={nextLevelLink} onClick={reporting.onSkipped}>
              <T id="skip" />
              <ArrowRight />
            </Link>
          )
        }
      />

      <main style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          ref={gameContainer}
          style={{
            flex: '2',
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />

        <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
          <Tutorial levelId={levelId} level={renderer.level} />
        </div>
      </main>
    </>
  );
}

function useReporting(levelId: string) {
  const tries = useRef(0);
  const timeout = useRef(0);
  const stopwatch = useRef(new Stopwatch());
  const sessionId = useRef<string>(null);

  const { data, setData } = use(UserDataContext);

  const setLevelData = (completed: boolean) => {
    const time = stopwatch.current.elapsed;

    if (data[levelId] === undefined) {
      setData({ ...data, [levelId]: { completed, tries: tries.current, time } });
    }

    if (sessionId.current !== null) {
      api
        .updateLevelSession({ params: { sessionId: sessionId.current }, body: { levelId, completed, time } })
        .catch(reportError);
    } else {
      api
        .createLevelSession({ body: { levelId, completed, time } })
        .then((id) => (sessionId.current = id))
        .catch(reportError);
    }
  };

  const setTimeout = (cb: () => void, ms: number) => {
    window.clearTimeout(timeout.current);
    timeout.current = window.setTimeout(cb, ms);
  };

  useEffect(() => {
    return () => window.clearTimeout(timeout.current);
  }, []);

  return {
    onLoaded: () => {
      tries.current = 0;
      stopwatch.current.restart();
      sessionId.current = null;
      setTimeout(() => stopwatch.current.pause(), 10_000);
    },

    onRestarted: () => {
      tries.current++;
      setLevelData(false);
      stopwatch.current.restart();
      setTimeout(() => stopwatch.current.pause(), 10_000);
    },

    onMoved: () => {
      stopwatch.current.unpause();
      setTimeout(() => stopwatch.current.pause(), 10_000);
    },

    onCompleted: () => {
      setLevelData(true);
    },

    onSkipped: () => {
      setLevelData(false);
    },
  };
}

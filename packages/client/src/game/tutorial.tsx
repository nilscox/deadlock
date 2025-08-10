import { Level } from '@deadlock/game';
import { use, useEffect, useState } from 'react';

import { LevelsContext, UserDataContext } from '../contexts';
import { createTranslate } from '../intl';

import styles from './tutorial.module.css';

const T = createTranslate('game.help');

type TutorialProps = {
  levelId: string;
  level: Level;
};

export function Tutorial({ levelId, level }: TutorialProps) {
  const levelNumber = use(LevelsContext).find(({ id }) => id === levelId)?.number;
  const { data } = use(UserDataContext);

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

    level.addListener('restarted', onRestarted);

    return () => {
      level.removeListener('restarted', onRestarted);
    };
  }, [level]);

  if (!show || data.completed) {
    return null;
  }

  if (Number(levelNumber) === 1) {
    return <HelpSwipe />;
  }

  if (Number(levelNumber) <= 7 && !restarted) {
    return <HelpRestart />;
  }

  return null;
}

function HelpSwipe() {
  return (
    <div className={styles.help}>
      <svg className={styles.swipe} viewBox="0 0 10 4" stroke="currentColor">
        <line x1="1" x2="9" y1="2" y2="2" strokeWidth="1" strokeLinecap="round" />
        <path d="M 7.5 1 L 9 2 L 7.5 3 Z" strokeLinejoin="round" fill="currentColor" />
      </svg>

      <div className={styles.helpText}>
        <T id="swipe" />
      </div>
    </div>
  );
}

function HelpRestart() {
  return (
    <div className={styles.help}>
      <svg className={styles.tapTwice} viewBox="0 0 4 4" fill="currentColor">
        <circle cx="2" cy="2" r="1.75" />
      </svg>

      <div className={styles.helpText}>
        <T id="tapTwice" />
      </div>
    </div>
  );
}

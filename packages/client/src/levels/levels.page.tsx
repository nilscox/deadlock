import type { LevelData } from '@deadlock/game';
import { ArrowLeft } from 'lucide-react';
import { use } from 'react';
import { Link } from 'wouter';

import { AppHeader } from '../app-header';
import { LevelsContext, UserDataContext } from '../contexts';
import { createTranslate } from '../intl';
import styles from './levels.page.module.css';

const T = createTranslate('levels');

export function LevelsPage() {
  const { data } = use(UserDataContext);

  return (
    <>
      <AppHeader
        left={
          <Link href="/">
            <ArrowLeft />
            <T id="home" />
          </Link>
        }
        center="Levels"
      />

      <main>
        <h1 className={styles.title}>
          <T id="title" />
        </h1>

        <ul className={styles.levelsList}>
          {use(LevelsContext).map((level) => (
            <li key={level.id}>
              <LevelItem level={level} completed={data[level.id]?.completed} />
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}

function LevelItem({ level, completed }: { level: LevelData; completed?: boolean }) {
  return (
    <Link href={`/levels/${level.id}`} data-completed={completed} className={styles.levelItem}>
      <div className={styles.levelNumber}>Level {level.number}</div>
      <div className={styles.levelId}>{level.id}</div>
    </Link>
  );
}

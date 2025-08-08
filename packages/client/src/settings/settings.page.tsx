import { ArrowLeft } from 'lucide-react';
import { use } from 'react';
import { Link } from 'wouter';

import { AppHeader } from '../app-header';
import { UserDataContext } from '../contexts';
import { createTranslate } from '../intl';

import classes from './settings.module.css';

const T = createTranslate('settings');

export function SettingsPage() {
  const t = T.useTranslate();
  const { setData } = use(UserDataContext);

  const restart = () => {
    if (window.confirm(t('restart.warning'))) {
      setData({});
      window.alert(t('restart.done'));
    }
  };

  return (
    <>
      <AppHeader
        left={
          <Link href="/">
            <ArrowLeft />
            <T id="home" />
          </Link>
        }
      />

      <main className={classes.main}>
        <header className={classes.header}>
          <h1 className={classes.title}>
            <T id="title" />
          </h1>
        </header>

        <ul className={classes.menu}>
          <li>
            <button onClick={() => alert('Not implemented')}>
              <T id="changeLanguage" />
            </button>
          </li>

          <li>
            <button onClick={playMusic}>
              <T id="playMusic" />
            </button>
          </li>

          <li>
            <button onClick={restart}>
              <T id="restartGame" />
            </button>
          </li>
        </ul>
      </main>
    </>
  );
}

function playMusic() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const player1 = document.querySelector('audio')!;
  const player2 = document.createElement('audio');

  player2.src = player1.src;

  let current = 0;

  function loop() {
    const player = current === 0 ? player1 : player2;
    const other = current === 0 ? player2 : player1;

    current++;
    current %= 2;

    other.pause();
    other.currentTime = 0;

    void player.play();
    setTimeout(loop, 585169);
  }

  loop();
}

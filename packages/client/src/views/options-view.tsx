import { animated, useSpring } from '@react-spring/web';
import { clsx } from 'clsx';
import { useEffect, useRef } from 'react';

import { ArrowLeft } from '~/components/arrows';
import { Link } from '~/components/link';
import { Translate } from '~/components/translate';
import { useBoolean } from '~/hooks/use-boolean';
import { useSetLocale } from '~/intl';
import { MobileNavigation, MobileView } from '~/mobile-view';

const T = Translate.prefix('views.options');

export const OptionsView = () => {
  const clearProgress = useClearProgress();

  return (
    <MobileView
      className="px-4"
      header={
        <MobileNavigation
          left={
            <Link href="/" className="row gap-2 items-center">
              <ArrowLeft />
              <Translate id="navigation.home" />
            </Link>
          }
        />
      }
    >
      <div className="flex-1 col justify-center">
        <h1 className="font-extrabold text-xl">
          <T id="title" />
        </h1>
      </div>

      <div className="flex-2">
        <ul className="col gap-4">
          <ChangeLanguage />

          <li>
            <button onClick={playMusic}>
              <T id="playMusic" />
            </button>
          </li>

          <li>
            <button onClick={clearProgress}>
              <T id="restartGame" />
            </button>
          </li>
        </ul>
      </div>
    </MobileView>
  );
};

const ChangeLanguage = () => {
  const setLocale = useSetLocale();

  const [open, , , toggle] = useBoolean(false);
  const [spring, animate] = useSpring(() => ({
    height: 0,
  }));

  useEffect(() => {
    if (open) {
      animate({ height: ref.current?.offsetHeight });
    } else {
      animate({ height: 0 });
    }
  }, [open, animate]);

  const ref = useRef<HTMLUListElement>(null);

  return (
    <>
      <li>
        <button onClick={toggle}>
          <T id="language.changeLanguage" />
        </button>
      </li>

      <animated.li style={spring} className={clsx('overflow-hidden', !open && '-mb-4')}>
        <ul ref={ref} className="col gap-4 pl-4 pb-4">
          <li>
            <button onClick={() => setLocale('en')}>
              <T id="language.english" />
            </button>
          </li>

          <li>
            <button onClick={() => setLocale('fr')}>
              <T id="language.french" />
            </button>
          </li>
        </ul>
      </animated.li>
    </>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useClearProgress = () => {
  const t = T.useTranslation();

  return () => {
    if (window.confirm(t('restartWarning'))) {
      localStorage.setItem('levels', '{}');
      window.location.href = '/';
    }
  };
};

const playMusic = () => {
  const player1 = document.querySelector('audio') as HTMLAudioElement;
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
};

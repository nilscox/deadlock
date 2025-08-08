import { animated, config, useChain, useSpring, useSpringRef, useTrail } from '@react-spring/web';
import { use } from 'react';
import { Link } from 'wouter';

import { LevelsContext, UserDataContext } from '../contexts';
import { createTranslate } from '../intl';

import classes from './home.module.css';

const T = createTranslate('home');

export function HomePage() {
  const t = T.useTranslate();

  return (
    <main className={classes.main}>
      <header className={classes.header}>
        <Title title={t('title')} />
      </header>

      <Menu />
    </main>
  );
}

function Title({ title }: { title: string }) {
  const lettersSpringsRef = useSpringRef();
  const lettersTrail = useTrail(title.length, {
    ref: lettersSpringsRef,
    config: config.stiff,
    from: { x: 100, opacity: 0, transform: 'scale(2)' },
    to: { x: 0, opacity: 1, transform: 'scale(1)' },
  });

  const borderSpringRef = useSpringRef();
  const [borderSpring] = useSpring(() => ({
    ref: borderSpringRef,
    from: { left: '100%' },
    to: { left: '0%' },
  }));

  useChain([lettersSpringsRef, borderSpringRef], [0, 0.75]);

  return (
    <h1 className={classes.title}>
      {title.split('').map((letter, index) => (
        <animated.span key={index} className={classes.letter} style={lettersTrail[index]}>
          {letter}
        </animated.span>
      ))}

      <animated.div className={classes.border} style={borderSpring} />
    </h1>
  );
}

function Menu() {
  const t = T.useTranslate();

  const levels = use(LevelsContext);
  const { data, setData } = use(UserDataContext);

  const firstLevel = levels[0];
  const nextLevel = levels.find((level) => !data[level.id]?.completed);

  const items: React.ReactNode[] = [];

  if (!nextLevel) {
    items.push(<button onClick={() => setData({})}>{t('restart')}</button>);
  } else if (nextLevel === firstLevel) {
    items.push(<Link href={`/levels/${firstLevel.id}`}>{t('start')}</Link>);
  } else {
    items.push(<Link href={`/levels/${nextLevel.id}`}>{t('continue')}</Link>);
  }

  items.push(<Link href="/levels">{t('levels')}</Link>);
  items.push(<Link href="/settings">{t('settings')}</Link>);

  const trail = useTrail(items.length, {
    from: { x: 20, opacity: 0 },
    to: { x: 0, opacity: 1 },
    delay: 1000,
  });

  return (
    <ul className={classes.menu}>
      {trail.map((style, index) => (
        <animated.li key={index} style={style}>
          {items[index]}
        </animated.li>
      ))}
    </ul>
  );
}

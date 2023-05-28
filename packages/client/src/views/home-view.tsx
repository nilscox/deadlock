import { animated, config, useChain, useSpring, useSpringRef, useTrail } from '@react-spring/web';
import { useCallback } from 'react';

import { useLevels } from '~/game/levels-api';
import { useLevelsMatching } from '~/game/levels-context';
import { Link } from '~/components/link';
import { MobileView } from '~/mobile-view';

import { useClearProgress } from './options-view';

export const HomeView = () => (
  <MobileView>
    <div className="flex-1 col justify-center px-4">
      <Title title="Deadlock" />
    </div>

    <div className="flex-1 col justify-center px-4">
      <Menu />
    </div>

    <div className="flex-1 col justify-center"></div>
  </MobileView>
);

type TitleProps = {
  title: string;
};

const Title = ({ title }: TitleProps) => {
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
    <h1 className="text-xl self-start relative font-extrabold">
      {title.split('').map((letter, index) => (
        <animated.span key={index} className="inline-block" style={lettersTrail[index]}>
          {letter}
        </animated.span>
      ))}

      <animated.div className="absolute border-2 inset-x-0" style={borderSpring} />
    </h1>
  );
};

const Menu = () => {
  const [nextLevel] = useLevelsMatching(useCallback((level, userData) => !userData?.completed, []));
  const firstLevel = Object.values(useLevels())[0];

  const clearProgress = useClearProgress();

  const items: JSX.Element[] = [];

  if (!nextLevel) {
    items.push(<button onClick={clearProgress}>Restart</button>);
  } else if (nextLevel === firstLevel) {
    items.push(<Link href={`/level/${firstLevel.id}`}>Start</Link>);
  } else {
    items.push(<Link href={`/level/${nextLevel.id}`}>Continue</Link>);
  }

  items.push(<Link href="/levels">Levels</Link>);
  items.push(<Link href="/options">Options</Link>);
  items.push(<Link href="/lab">Lab</Link>);

  const trail = useTrail(items.length, {
    from: { x: 20, opacity: 0 },
    to: { x: 0, opacity: 1 },
    delay: 1500,
  });

  return (
    <ul className="text-lg col gap-4">
      {trail.map((style, index) => (
        <animated.li key={index} style={style}>
          {items[index]}
        </animated.li>
      ))}
    </ul>
  );
};

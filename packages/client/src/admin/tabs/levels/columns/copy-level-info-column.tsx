import { Level } from '@deadlock/game';

import { copy } from '~/utils';

import { LevelRow } from '../levels-tab';

type CopyProps = {
  level: LevelRow;
};

export const Copy = ({ level }: CopyProps) => {
  const getJSON = () => {
    return JSON.stringify(level.definition);
  };

  const getHash = () => {
    return new Level(level.definition).hash;
  };

  const getFingerprint = () => {
    return new Level(level.definition).fingerprint;
  };

  return (
    <ul className="row gap-4">
      <li>
        <button onClick={() => copy(getJSON())}>JSON</button>
      </li>

      <li>
        <button onClick={() => copy(getHash())}>hash</button>
      </li>

      <li>
        <button onClick={() => copy(getFingerprint())}>FP</button>
      </li>
    </ul>
  );
};

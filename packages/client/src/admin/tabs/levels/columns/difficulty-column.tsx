import { useMemo } from 'react';

type DifficultyProps = {
  effectiveDifficulty: number;
  evaluatedDifficulty: number;
};
export const Difficulty = ({ effectiveDifficulty, evaluatedDifficulty }: DifficultyProps) => {
  const [r, g, b] = useMemo(() => {
    const r = 255 * Math.min(1, effectiveDifficulty / 6);
    const g = 255 - r;
    const b = 0;

    return [r, g, b];
  }, [effectiveDifficulty]);

  return (
    <>
      <span className="font-bold" style={{ color: `rgb(${r}, ${g}, ${b})` }}>
        {effectiveDifficulty}
      </span>

      <span className="ml-2 text-muted text-sm">(evaluated: {evaluatedDifficulty})</span>
    </>
  );
};

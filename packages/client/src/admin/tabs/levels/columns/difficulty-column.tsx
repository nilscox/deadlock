import { useMemo } from 'react';

type DifficultyProps = {
  effective: number | null;
  evaluated: number;
};

export const Difficulty = ({ effective, evaluated }: DifficultyProps) => {
  const [r, g, b] = useMemo(() => {
    if (effective === null) {
      return [0, 0, 0];
    }

    const r = 255 * Math.min(1, effective / 6);
    const g = 255 - r;
    const b = 0;

    return [r, g, b];
  }, [effective]);

  return (
    <>
      <span className="font-bold" style={{ color: `rgb(${r}, ${g}, ${b})` }}>
        {effective ?? '-'}
      </span>

      <span className="ml-2 text-muted text-sm">(evaluated: {evaluated})</span>
    </>
  );
};

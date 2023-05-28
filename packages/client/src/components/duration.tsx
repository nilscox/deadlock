type DurationProps = {
  value: number;
};

export const Duration = ({ value }: DurationProps) => {
  const { min, sec } = {
    min: Math.floor(value / 60),
    sec: value % 60,
  };

  const result = new Array<string>();

  if (min > 0) {
    result.push(`${min}m`);
  }

  result.push(`${sec}s`);

  return <>{result.join(', ')}</>;
};

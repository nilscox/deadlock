type PlayTimeColumnProps = {
  mean: number;
  min: number;
  max: number;
};

export const PlayTimeColumn = ({ mean, min, max }: PlayTimeColumnProps) => (
  <>
    {mean}s
    <span className="ml-2 text-muted text-sm">
      (min: {min}s, max; {max}s)
    </span>
  </>
);

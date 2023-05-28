import { Duration } from '~/components/duration';

type PlayTimeColumnProps = {
  mean: number;
  min: number;
  max: number;
};

export const PlayTimeColumn = ({ mean, min, max }: PlayTimeColumnProps) => (
  <>
    <Duration value={mean} />
    <span className="ml-2 text-muted text-sm">
      (min: <Duration value={min} />, max; <Duration value={max} />)
    </span>
  </>
);

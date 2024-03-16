type TriesColumnProps = {
  mean: number;
  min: number;
  max: number;
};

export const TriesColumn = ({ mean, min, max }: TriesColumnProps) => (
  <>
    {mean}
    <span className="ml-2 text-muted text-sm">
      (min: {min}, max: {max})
    </span>
  </>
);

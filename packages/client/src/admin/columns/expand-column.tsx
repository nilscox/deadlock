import IconChevronDown from '@heroicons/react/24/solid/ChevronDownIcon';
import IconChevronRight from '@heroicons/react/24/solid/ChevronRightIcon';

type ExpandColumnProps = {
  expanded: boolean;
  onExpand: () => void;
};

export const ExpandColumn = ({ expanded, onExpand }: ExpandColumnProps) => (
  <button onClick={onExpand}>
    {expanded ? <IconChevronDown className="w-4 h-4" /> : <IconChevronRight className="w-4 h-4" />}
  </button>
);

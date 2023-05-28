import { clsx } from 'clsx';
import { useRoute, Link } from 'wouter';

type TabsProps = {
  children: React.ReactNode;
};

export const Tabs = ({ children }: TabsProps) => (
  <nav role="tablist" className="p-4 row gap-6 text-lg font-semibold">
    {children}
  </nav>
);

type TabProps = {
  href: string;
  children: React.ReactNode;
};

export const Tab = ({ href, children }: TabProps) => {
  const [isActive] = useRoute(href);

  return (
    <Link
      href={href}
      role="tab"
      aria-selected={isActive}
      className={clsx('py-2 border-black transition-colors', isActive && 'border-b-2')}
    >
      {children}
    </Link>
  );
};

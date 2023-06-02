import { clsx } from 'clsx';
import { useEffect } from 'react';

type MobileViewProps = {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export const MobileView = ({ header, footer, className, children }: MobileViewProps) => {
  useEffect(() => {
    document.documentElement.classList.add('mobile');
    return () => document.documentElement.classList.remove('mobile');
  }, []);

  return (
    <div className="h-full col">
      {header && (
        <header className="bg-header py-4">
          <div className="max-w-[600px] mx-auto">{header}</div>
        </header>
      )}

      <main className={clsx('flex-1 overflow-auto col items-center', className)}>
        <div className="w-full max-w-[600px] mx-auto flex-1 col p-4">{children}</div>
      </main>

      {footer && (
        <footer className="p-4">
          <div className="max-w-[600px] mx-auto">{footer}</div>
        </footer>
      )}
    </div>
  );
};

type MobileNavigationProps = {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
};

export const MobileNavigation = ({ left, center, right }: MobileNavigationProps) => (
  <nav className="grid grid-cols-3 items-center px-4">
    <div>{left}</div>
    <div className="mx-auto">{center}</div>
    <div className="ml-auto">{right}</div>
  </nav>
);

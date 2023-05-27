import { useEffect } from 'react';

type MobileViewProps = {
  children: React.ReactNode;
};

export const MobileView = ({ children }: MobileViewProps) => {
  useEffect(() => {
    document.documentElement.classList.add('mobile');
    return () => document.documentElement.classList.remove('mobile');
  }, []);

  return <div className="max-w-[600px] mx-auto h-full p-4 col">{children}</div>;
};

type MobileViewProps = {
  children: React.ReactNode;
};

export const MobileView = ({ children }: MobileViewProps) => (
  <div className="max-w-[600px] mx-auto h-full p-4 col">{children}</div>
);

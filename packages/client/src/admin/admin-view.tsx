import { LevelsTab } from './tabs/levels/levels-tab';

export const AdminView = () => (
  <div className="h-full col">
    <nav className="p-4 row gap-6 text-lg font-semibold">
      <div className="py-2 border-b-2 border-black">Levels</div>
      <div className="py-2 text-muted">Sessions</div>
    </nav>

    <div className="p-4 flex-1 overflow-hidden">
      <LevelsTab />
    </div>
  </div>
);

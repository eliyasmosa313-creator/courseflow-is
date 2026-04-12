import { Search, Bell } from "lucide-react";

const DashboardHeader = () => {
  return (
    <header className="sticky top-0 z-40 bg-background border-b border-foreground/10 px-5 md:px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <input
            type="text"
            placeholder="Search sessions, students, assignments..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border-2 border-foreground/15 bg-transparent text-sm font-sans focus:outline-none focus:border-foreground/40 transition-colors placeholder:text-foreground/40"
          />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent-red rounded-full" />
          </button>
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
            alt="Profile"
            className="w-9 h-9 rounded-full object-cover border-2 border-foreground/10"
          />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

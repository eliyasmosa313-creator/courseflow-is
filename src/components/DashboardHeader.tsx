import { Bell, Moon, Sun, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import GlobalSearch from "./GlobalSearch";
import { useAuth } from "@/hooks/useAuth";

const DashboardHeader = () => {
  const { signOut, user } = useAuth();
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-foreground/10 px-5 md:px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        <GlobalSearch />

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDark(d => !d)}
            className="relative p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent-red rounded-full" />
          </button>
          <button
            onClick={signOut}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Video,
  Calendar,
  ClipboardList,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "DASHBOARD", path: "/", icon: LayoutDashboard },
  { label: "COURSES", path: "/courses", icon: BookOpen },
  { label: "LIVE SESSIONS", path: "/sessions", icon: Video },
  { label: "SCHEDULE", path: "/schedule", icon: Calendar },
  { label: "ASSIGNMENTS", path: "/assignments", icon: ClipboardList },
  { label: "STUDENTS", path: "/students", icon: Users },
  { label: "SETTINGS", path: "/settings", icon: Settings },
];

const DashboardSidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen border-r border-foreground/10 bg-background flex flex-col transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b border-foreground/10 flex items-center justify-between">
        {!collapsed && (
          <Link to="/" className="font-serif text-2xl font-bold italic">
            CourseFlow
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-full hover:bg-muted transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-2xl nav-text transition-all duration-200",
              isActive(item.path)
                ? "bg-primary text-foreground"
                : "text-foreground/60 hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom profile */}
      <div className="px-3 py-4 border-t border-foreground/10">
        <div className="flex items-center gap-3 px-3">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">Dr. Elena Martinez</p>
              <p className="text-xs text-foreground/50 truncate">Instructor</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;

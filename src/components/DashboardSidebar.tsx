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
import { useAuth } from "@/hooks/useAuth";

const allNavItems = [
  { label: "DASHBOARD", path: "/", icon: LayoutDashboard, roles: ["viewer", "student", "instructor"] },
  { label: "COURSES", path: "/courses", icon: BookOpen, roles: ["student", "instructor"] },
  { label: "LIVE SESSIONS", path: "/sessions", icon: Video, roles: ["student", "instructor"] },
  { label: "SCHEDULE", path: "/schedule", icon: Calendar, roles: ["student", "instructor"] },
  { label: "ASSIGNMENTS", path: "/assignments", icon: ClipboardList, roles: ["student", "instructor"] },
  { label: "STUDENTS", path: "/students", icon: Users, roles: ["instructor"] },
  { label: "SETTINGS", path: "/settings", icon: Settings, roles: ["viewer", "student", "instructor"] },
];

const DashboardSidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { roles, isViewer, user } = useAuth();

  const navItems = allNavItems.filter((item) => {
    if (isViewer) return item.roles.includes("viewer");
    return item.roles.some((r) => roles.includes(r as any));
  });

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const displayName = user?.user_metadata?.display_name || user?.email || "User";
  const roleLabel = roles.includes("instructor") ? "Instructor" : roles.includes("student") ? "Student" : "Viewer";

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
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{displayName}</p>
              <p className="text-xs text-foreground/50 truncate">{roleLabel}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;

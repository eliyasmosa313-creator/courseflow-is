import { useState, useRef, useEffect, useMemo } from "react";
import { Search, X, Monitor, BookOpen, Users, Calendar, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { sessions, students, assignments, scheduleEvents } from "@/data/courseflow";

interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  type: "page" | "session" | "assignment" | "student" | "schedule";
  href: string;
}

const pages: SearchResult[] = [
  { id: "p-dash", label: "Dashboard", sublabel: "Overview & stats", type: "page", href: "/" },
  { id: "p-sess", label: "Live Sessions", sublabel: "All sessions", type: "page", href: "/sessions" },
  { id: "p-sched", label: "Schedule", sublabel: "Calendar & events", type: "page", href: "/schedule" },
  { id: "p-assign", label: "Assignments", sublabel: "Homework & grading", type: "page", href: "/assignments" },
  { id: "p-stud", label: "Students", sublabel: "Enrolled students", type: "page", href: "/students" },
  { id: "p-set", label: "Settings", sublabel: "Account & preferences", type: "page", href: "/settings" },
];

const typeIcons: Record<string, typeof Search> = {
  page: Monitor,
  session: Monitor,
  assignment: BookOpen,
  student: Users,
  schedule: Calendar,
};

const typeLabels: Record<string, string> = {
  page: "PAGE",
  session: "SESSION",
  assignment: "ASSIGNMENT",
  student: "STUDENT",
  schedule: "SCHEDULE",
};

const GlobalSearch = () => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const allItems = useMemo<SearchResult[]>(() => {
    return [
      ...pages,
      ...sessions.map(s => ({
        id: `s-${s.id}`,
        label: s.title,
        sublabel: `${s.instructor} · ${s.category}`,
        type: "session" as const,
        href: `/sessions/${s.id}`,
      })),
      ...assignments.map(a => ({
        id: `a-${a.id}`,
        label: a.title,
        sublabel: a.course,
        type: "assignment" as const,
        href: "/assignments",
      })),
      ...students.map(st => ({
        id: `st-${st.id}`,
        label: st.name,
        sublabel: st.email,
        type: "student" as const,
        href: "/students",
      })),
      ...scheduleEvents.map(ev => ({
        id: `ev-${ev.id}`,
        label: ev.title,
        sublabel: `${ev.date} · ${ev.time}`,
        type: "schedule" as const,
        href: "/schedule",
      })),
    ];
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allItems.filter(
      item =>
        item.label.toLowerCase().includes(q) ||
        item.sublabel.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query, allItems]);

  useEffect(() => {
    setActiveIndex(0);
  }, [results]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const go = (result: SearchResult) => {
    navigate(result.href);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      go(results[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="flex-1 max-w-md relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search sessions, students, assignments..."
        className="w-full pl-10 pr-9 py-2.5 rounded-full border-2 border-foreground/15 bg-transparent text-sm font-sans focus:outline-none focus:border-foreground/40 transition-colors placeholder:text-foreground/40"
      />
      {query && (
        <button
          onClick={() => { setQuery(""); inputRef.current?.focus(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {open && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border-2 border-foreground/10 bg-background shadow-xl overflow-hidden z-50">
          {results.length === 0 ? (
            <div className="px-5 py-8 text-center text-foreground/40 font-serif text-sm">
              No results for "{query}"
            </div>
          ) : (
            <ul className="py-2">
              {results.map((r, i) => {
                const Icon = typeIcons[r.type] || Search;
                return (
                  <li key={r.id}>
                    <button
                      onClick={() => go(r)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                        i === activeIndex ? "bg-foreground/5" : ""
                      }`}
                    >
                      <Icon className="w-4 h-4 text-foreground/40 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold font-sans truncate">{r.label}</p>
                        <p className="text-xs text-foreground/50 font-sans truncate">{r.sublabel}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-foreground/15 text-foreground/40 flex-shrink-0">
                        {typeLabels[r.type]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;

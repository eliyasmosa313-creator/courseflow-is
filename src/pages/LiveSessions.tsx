import { useState } from "react";
import SessionCard from "@/components/SessionCard";
import Button from "@/components/Button";
import { sessions } from "@/data/courseflow";

const LiveSessions = () => {
  const [filter, setFilter] = useState<"all" | "live" | "upcoming" | "completed">("all");
  const filtered = filter === "all" ? sessions : sessions.filter(s => s.status === filter);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.8] font-sans">
          LIVE SESSIONS
        </h1>
        <p className="text-base text-foreground/60 mt-3 font-serif">
          Manage and monitor all your teaching sessions.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        {(["all", "live", "upcoming", "completed"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`nav-text px-5 py-2.5 rounded-full border-2 border-foreground transition-all duration-200 ${
              filter === f
                ? "bg-foreground text-background"
                : "bg-transparent text-foreground hover:bg-foreground hover:text-background"
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(session => (
          <SessionCard key={session.id} {...session} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-foreground/40 font-serif text-lg">No sessions match this filter.</p>
        </div>
      )}
    </div>
  );
};

export default LiveSessions;

import { cn } from "@/lib/utils";
import { Clock, User } from "lucide-react";
import { scheduleEvents } from "@/data/courseflow";

const typeLabels: Record<string, string> = {
  session: "SESSION",
  "office-hours": "OFFICE HOURS",
  review: "REVIEW",
  assignment: "DEADLINE",
};

const Schedule = () => {
  // Group by date
  const grouped = scheduleEvents.reduce<Record<string, typeof scheduleEvents>>((acc, ev) => {
    (acc[ev.date] = acc[ev.date] || []).push(ev);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.8] font-sans">
          SCHEDULE
        </h1>
        <p className="text-base text-foreground/60 mt-3 font-serif">
          Your upcoming sessions, deadlines, and office hours.
        </p>
      </div>

      <div className="space-y-10">
        {Object.entries(grouped).map(([date, events]) => (
          <div key={date}>
            <h2 className="nav-text text-foreground/50 mb-4">{date.toUpperCase()}</h2>
            <div className="space-y-3">
              {events.map(ev => (
                <div key={ev.id} className={cn("rounded-3xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center gap-4 card-hover", ev.colorClass)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-foreground/20 bg-foreground/10">
                        {typeLabels[ev.type] || ev.type.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-extrabold tracking-tight font-sans truncate">{ev.title}</h3>
                  </div>
                  <div className="flex items-center gap-5 text-sm text-foreground/60 font-sans flex-shrink-0">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{ev.time} · {ev.duration}</span>
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{ev.instructor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;

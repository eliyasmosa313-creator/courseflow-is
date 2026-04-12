import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import Button from "@/components/Button";
import { assignments } from "@/data/courseflow";

const statusStyles: Record<string, string> = {
  active: "bg-vibrant-mint text-foreground",
  grading: "bg-vibrant-yellow text-foreground",
  completed: "bg-foreground/10 text-foreground/60",
  draft: "bg-vibrant-lavender text-foreground",
};

const Assignments = () => {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.8] font-sans">
            ASSIGNMENTS
          </h1>
          <p className="text-base text-foreground/60 mt-3 font-serif">
            Create, review, and grade student assignments.
          </p>
        </div>
        <Button variant="filled">CREATE NEW</Button>
      </div>

      {/* Table-like cards */}
      <div className="space-y-4">
        {assignments.map(a => (
          <div key={a.id} className={cn("rounded-3xl p-6 flex flex-col md:flex-row md:items-center gap-4 card-hover", a.colorClass)}>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl md:text-2xl font-extrabold tracking-tight font-sans">{a.title}</h3>
              <p className="text-sm text-foreground/60 font-sans mt-1">{a.course}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm font-sans">
              <span className="flex items-center gap-1 text-foreground/60">
                <Calendar className="w-3.5 h-3.5" /> {a.dueDate}
              </span>
              <span className="text-foreground/60">{a.submissions}/{a.totalStudents} submitted</span>
              <span className={cn("text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full", statusStyles[a.status])}>
                {a.status.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assignments;

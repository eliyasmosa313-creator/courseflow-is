import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Clock, Users } from "lucide-react";
import Button from "./Button";
import { Session } from "@/data/courseflow";

const SessionCard = ({ id, title, instructor, instructorAvatar, date, time, duration, status, students, maxStudents, colorClass, category }: Session) => {
  const statusLabel = status === "live" ? "● LIVE NOW" : status === "upcoming" ? "UPCOMING" : "COMPLETED";

  return (
    <Link to={`/sessions/${id}`} className="block">
      <article className={cn("card-hover rounded-3xl overflow-hidden flex flex-col h-full", colorClass)}>
        {/* Top bar */}
        <div className="p-5 pb-0 flex items-center justify-between">
          <span className={cn(
            "text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border-2 border-foreground/20",
            status === "live" ? "bg-accent-red text-foreground" : "bg-foreground/10"
          )}>
            {statusLabel}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">{category}</span>
        </div>

        {/* Content */}
        <div className="p-5 md:p-6 flex flex-col flex-1">
          <h2 className="text-3xl md:text-4xl leading-[0.85] mb-3 font-sans font-extrabold tracking-tighter">
            {title}
          </h2>

          {/* Instructor */}
          <div className="flex items-center gap-2 mb-4">
            <img src={instructorAvatar} alt={instructor} className="w-6 h-6 rounded-full object-cover" />
            <span className="text-sm font-medium text-foreground/70">{instructor}</span>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-foreground/60 mb-4 font-sans">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{time} · {duration}</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{students}/{maxStudents}</span>
          </div>

          <div className="mt-auto">
            <Button
              variant="filled"
              className="text-xs py-2 px-5 self-start"
              showArrow={status !== "completed"}
            >
              {status === "live" ? "JOIN NOW" : status === "upcoming" ? "VIEW DETAILS" : "REVIEW"}
            </Button>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default SessionCard;

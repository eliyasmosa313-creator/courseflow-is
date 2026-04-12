import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/Button";
import { sessions, students as allStudents } from "@/data/courseflow";

const SessionDetail = () => {
  const { id } = useParams();
  const session = sessions.find(s => s.id === id);

  if (!session) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-extrabold font-sans">SESSION NOT FOUND</h1>
        <Link to="/sessions" className="mt-4 inline-block underline font-sans">Back to sessions</Link>
      </div>
    );
  }

  const enrolledStudents = allStudents.slice(0, Math.min(allStudents.length, 4));

  return (
    <div>
      {/* Back */}
      <Link to="/sessions" className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-6 nav-text">
        <ArrowLeft className="w-4 h-4" /> BACK TO SESSIONS
      </Link>

      {/* Hero card */}
      <div className={cn("rounded-3xl p-8 md:p-12 mb-8", session.colorClass)}>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className={cn(
            "text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border-2 border-foreground/20",
            session.status === "live" ? "bg-accent-red" : "bg-foreground/10"
          )}>
            {session.status === "live" ? "● LIVE NOW" : session.status.toUpperCase()}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">{session.category}</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.8] font-sans mb-6">
          {session.title}
        </h1>

        <p className="text-base md:text-lg text-foreground/80 font-serif mb-6 max-w-2xl">
          {session.description}
        </p>

        <div className="flex flex-wrap gap-6 text-sm font-sans text-foreground/70 mb-8">
          <span className="flex items-center gap-2"><Calendar className="w-4 h-4" />{session.date}</span>
          <span className="flex items-center gap-2"><Clock className="w-4 h-4" />{session.time} · {session.duration}</span>
          <span className="flex items-center gap-2"><Users className="w-4 h-4" />{session.students}/{session.maxStudents} students</span>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <img src={session.instructorAvatar} alt={session.instructor} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <p className="font-bold text-sm font-sans">{session.instructor}</p>
            <p className="text-xs text-foreground/50">Instructor</p>
          </div>
        </div>

        {session.status !== "completed" && (
          <Button variant="filled">
            {session.status === "live" ? "JOIN SESSION" : "SET REMINDER"}
          </Button>
        )}
      </div>

      {/* Enrolled Students */}
      <h2 className="text-2xl font-extrabold uppercase tracking-tight font-sans mb-4">ENROLLED STUDENTS</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {enrolledStudents.map(student => (
          <div key={student.id} className="rounded-3xl bg-vibrant-lavender p-5 card-hover">
            <div className="flex items-center gap-3 mb-3">
              <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="font-bold text-sm font-sans">{student.name}</p>
                <p className="text-xs text-foreground/50">{student.email}</p>
              </div>
            </div>
            <div className="w-full bg-foreground/10 rounded-full h-2">
              <div className="bg-foreground h-2 rounded-full transition-all" style={{ width: `${student.progress}%` }} />
            </div>
            <p className="text-xs text-foreground/50 mt-1 font-sans">{student.progress}% complete</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionDetail;

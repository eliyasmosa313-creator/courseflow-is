import { cn } from "@/lib/utils";
import { students } from "@/data/courseflow";

const Students = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.8] font-sans">
          STUDENTS
        </h1>
        <p className="text-base text-foreground/60 mt-3 font-serif">
          View and manage enrolled students across all courses.
        </p>
      </div>

      {/* Student cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {students.map((student, i) => {
          const colors = ["bg-vibrant-purple", "bg-vibrant-coral", "bg-vibrant-blue", "bg-vibrant-mint", "bg-vibrant-yellow", "bg-vibrant-lavender"];
          return (
            <div key={student.id} className={cn("rounded-3xl p-6 card-hover", colors[i % colors.length])}>
              <div className="flex items-center gap-3 mb-5">
                <img src={student.avatar} alt={student.name} className="w-12 h-12 rounded-full object-cover" />
                <div className="min-w-0">
                  <h3 className="font-bold text-base font-sans truncate">{student.name}</h3>
                  <p className="text-xs text-foreground/50 truncate">{student.email}</p>
                </div>
                <span className={cn(
                  "ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-foreground/20",
                  student.status === "active" ? "bg-vibrant-mint" : "bg-foreground/10"
                )}>
                  {student.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center mb-5">
                <div>
                  <p className="text-2xl font-extrabold font-sans">{student.enrolledCourses}</p>
                  <p className="text-[10px] uppercase tracking-wider text-foreground/50 font-sans">Courses</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold font-sans">{student.completedSessions}</p>
                  <p className="text-[10px] uppercase tracking-wider text-foreground/50 font-sans">Sessions</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold font-sans">{student.progress}%</p>
                  <p className="text-[10px] uppercase tracking-wider text-foreground/50 font-sans">Progress</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-foreground/10 rounded-full h-2">
                <div className="bg-foreground h-2 rounded-full transition-all" style={{ width: `${student.progress}%` }} />
              </div>
              <p className="text-xs text-foreground/50 mt-2 font-sans">Joined {student.joinDate}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Students;

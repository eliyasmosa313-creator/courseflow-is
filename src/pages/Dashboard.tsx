import { Users, Video, CheckCircle, TrendingUp, Eye } from "lucide-react";
import StatCard from "@/components/StatCard";
import SessionCard from "@/components/SessionCard";
import { sessions, dashboardStats } from "@/data/courseflow";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { isViewer, isStudent, isInstructor, user } = useAuth();
  const liveSessions = sessions.filter(s => s.status === "live" || s.status === "upcoming").slice(0, 3);

  if (isViewer) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.8] font-sans">
            WELCOME
          </h1>
          <p className="text-base text-foreground/60 mt-3 font-serif">
            You are currently a Viewer. Contact an instructor to get assigned as a student.
          </p>
        </div>
        <div className="rounded-3xl bg-vibrant-purple p-8 md:p-12">
          <Eye className="w-12 h-12 mb-4 text-foreground/40" />
          <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight font-sans mb-3">
            VIEWER ACCESS
          </h2>
          <p className="text-foreground/70 font-serif max-w-xl">
            As a viewer, you can explore the general interface. To access courses, sessions, assignments, and grades, you need to be assigned as a student by an instructor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.8] font-sans">
          DASHBOARD
        </h1>
        <p className="text-base text-foreground/60 mt-3 font-serif">
          Welcome back{user?.user_metadata?.display_name ? `, ${user.user_metadata.display_name}` : ""}. Here's your overview.
        </p>
      </div>

      {isInstructor && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatCard label="TOTAL STUDENTS" value={dashboardStats.totalStudents} icon={Users} colorClass="bg-vibrant-purple" />
          <StatCard label="ACTIVE SESSIONS" value={dashboardStats.activeSessions} icon={Video} colorClass="bg-vibrant-coral" />
          <StatCard label="COMPLETED THIS WEEK" value={dashboardStats.completedThisWeek} icon={CheckCircle} colorClass="bg-vibrant-mint" />
          <StatCard label="AVG ATTENDANCE" value={dashboardStats.avgAttendance} icon={TrendingUp} colorClass="bg-vibrant-yellow" suffix="%" />
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight font-sans">
          UPCOMING SESSIONS
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {liveSessions.map(session => (
          <SessionCard key={session.id} {...session} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

import { Users, Video, CheckCircle, TrendingUp } from "lucide-react";
import StatCard from "@/components/StatCard";
import SessionCard from "@/components/SessionCard";
import { sessions, dashboardStats } from "@/data/courseflow";

const Dashboard = () => {
  const liveSessions = sessions.filter(s => s.status === "live" || s.status === "upcoming").slice(0, 3);

  return (
    <div>
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.8] font-sans">
          DASHBOARD
        </h1>
        <p className="text-base text-foreground/60 mt-3 font-serif">
          Welcome back, Dr. Martinez. Here's your overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard label="TOTAL STUDENTS" value={dashboardStats.totalStudents} icon={Users} colorClass="bg-vibrant-purple" />
        <StatCard label="ACTIVE SESSIONS" value={dashboardStats.activeSessions} icon={Video} colorClass="bg-vibrant-coral" />
        <StatCard label="COMPLETED THIS WEEK" value={dashboardStats.completedThisWeek} icon={CheckCircle} colorClass="bg-vibrant-mint" />
        <StatCard label="AVG ATTENDANCE" value={dashboardStats.avgAttendance} icon={TrendingUp} colorClass="bg-vibrant-yellow" suffix="%" />
      </div>

      {/* Upcoming / Live Sessions */}
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

// CourseFlow SaaS Dashboard Data

export interface Session {
  id: string;
  title: string;
  instructor: string;
  instructorAvatar: string;
  date: string;
  time: string;
  duration: string;
  status: "live" | "upcoming" | "completed";
  students: number;
  maxStudents: number;
  colorClass: string;
  category: string;
  description: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  enrolledCourses: number;
  completedSessions: number;
  progress: number;
  joinDate: string;
  status: "active" | "inactive" | "suspended";
}

export interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  submissions: number;
  totalStudents: number;
  status: "active" | "grading" | "completed" | "draft";
  colorClass: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  type: "session" | "assignment" | "office-hours" | "review";
  date: string;
  time: string;
  duration: string;
  instructor: string;
  colorClass: string;
}

export const sessions: Session[] = [
  {
    id: "1",
    title: "ADVANCED REACT PATTERNS",
    instructor: "Dr. Elena Martinez",
    instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    date: "April 12, 2026",
    time: "10:00 AM",
    duration: "90 min",
    status: "live",
    students: 28,
    maxStudents: 35,
    colorClass: "bg-vibrant-coral",
    category: "Frontend",
    description: "Deep dive into compound components, render props, and custom hooks for scalable React architecture."
  },
  {
    id: "2",
    title: "DATABASE DESIGN FUNDAMENTALS",
    instructor: "Prof. James Chen",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    date: "April 12, 2026",
    time: "2:00 PM",
    duration: "60 min",
    status: "upcoming",
    students: 42,
    maxStudents: 50,
    colorClass: "bg-vibrant-blue",
    category: "Backend",
    description: "Normalization, indexing strategies, and query optimization for production databases."
  },
  {
    id: "3",
    title: "UI/UX DESIGN SYSTEMS",
    instructor: "Sarah Kim",
    instructorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    date: "April 13, 2026",
    time: "11:00 AM",
    duration: "75 min",
    status: "upcoming",
    students: 19,
    maxStudents: 30,
    colorClass: "bg-vibrant-purple",
    category: "Design",
    description: "Building cohesive design systems with tokens, components, and documentation workflows."
  },
  {
    id: "4",
    title: "NODE.JS MICROSERVICES",
    instructor: "Dr. Elena Martinez",
    instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    date: "April 11, 2026",
    time: "9:00 AM",
    duration: "120 min",
    status: "completed",
    students: 35,
    maxStudents: 35,
    colorClass: "bg-vibrant-mint",
    category: "Backend",
    description: "Architecting event-driven microservices with Node.js, RabbitMQ, and Docker."
  },
  {
    id: "5",
    title: "TYPESCRIPT DEEP DIVE",
    instructor: "Prof. James Chen",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    date: "April 14, 2026",
    time: "3:00 PM",
    duration: "90 min",
    status: "upcoming",
    students: 22,
    maxStudents: 40,
    colorClass: "bg-vibrant-yellow",
    category: "Frontend",
    description: "Generics, conditional types, mapped types, and advanced type inference patterns."
  },
  {
    id: "6",
    title: "FIGMA FOR DEVELOPERS",
    instructor: "Sarah Kim",
    instructorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    date: "April 10, 2026",
    time: "1:00 PM",
    duration: "60 min",
    status: "completed",
    students: 30,
    maxStudents: 30,
    colorClass: "bg-vibrant-magenta",
    category: "Design",
    description: "Bridging the design-dev gap: auto-layout, variants, and design token export workflows."
  },
];

export const students: Student[] = [
  {
    id: "1", name: "Alex Rivera", email: "alex@courseflow.io",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    enrolledCourses: 4, completedSessions: 18, progress: 72, joinDate: "Jan 15, 2026", status: "active"
  },
  {
    id: "2", name: "Maya Patel", email: "maya@courseflow.io",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    enrolledCourses: 3, completedSessions: 24, progress: 91, joinDate: "Dec 3, 2025", status: "active"
  },
  {
    id: "3", name: "Jordan Lee", email: "jordan@courseflow.io",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    enrolledCourses: 5, completedSessions: 12, progress: 45, joinDate: "Feb 20, 2026", status: "active"
  },
  {
    id: "4", name: "Sam Okafor", email: "sam@courseflow.io",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    enrolledCourses: 2, completedSessions: 8, progress: 60, joinDate: "Mar 1, 2026", status: "active"
  },
  {
    id: "5", name: "Taylor Brooks", email: "taylor@courseflow.io",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    enrolledCourses: 3, completedSessions: 5, progress: 28, joinDate: "Mar 22, 2026", status: "inactive"
  },
  {
    id: "6", name: "Priya Sharma", email: "priya@courseflow.io",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    enrolledCourses: 6, completedSessions: 32, progress: 95, joinDate: "Nov 10, 2025", status: "active"
  },
];

export const assignments: Assignment[] = [
  { id: "1", title: "BUILD A COMPONENT LIBRARY", course: "Advanced React Patterns", dueDate: "April 18, 2026", submissions: 14, totalStudents: 28, status: "active", colorClass: "bg-vibrant-coral" },
  { id: "2", title: "DATABASE SCHEMA DESIGN", course: "Database Fundamentals", dueDate: "April 20, 2026", submissions: 38, totalStudents: 42, status: "grading", colorClass: "bg-vibrant-blue" },
  { id: "3", title: "DESIGN TOKEN SYSTEM", course: "UI/UX Design Systems", dueDate: "April 22, 2026", submissions: 0, totalStudents: 19, status: "draft", colorClass: "bg-vibrant-purple" },
  { id: "4", title: "MICROSERVICE API GATEWAY", course: "Node.js Microservices", dueDate: "April 15, 2026", submissions: 35, totalStudents: 35, status: "completed", colorClass: "bg-vibrant-mint" },
  { id: "5", title: "TYPE-SAFE API CLIENT", course: "TypeScript Deep Dive", dueDate: "April 25, 2026", submissions: 0, totalStudents: 22, status: "active", colorClass: "bg-vibrant-yellow" },
];

export const scheduleEvents: ScheduleEvent[] = [
  { id: "1", title: "Advanced React Patterns", type: "session", date: "April 12, 2026", time: "10:00 AM", duration: "90 min", instructor: "Dr. Elena Martinez", colorClass: "bg-vibrant-coral" },
  { id: "2", title: "Database Design Fundamentals", type: "session", date: "April 12, 2026", time: "2:00 PM", duration: "60 min", instructor: "Prof. James Chen", colorClass: "bg-vibrant-blue" },
  { id: "3", title: "Office Hours — Frontend", type: "office-hours", date: "April 12, 2026", time: "4:00 PM", duration: "30 min", instructor: "Dr. Elena Martinez", colorClass: "bg-vibrant-yellow" },
  { id: "4", title: "UI/UX Design Systems", type: "session", date: "April 13, 2026", time: "11:00 AM", duration: "75 min", instructor: "Sarah Kim", colorClass: "bg-vibrant-purple" },
  { id: "5", title: "Assignment Review — DB Schema", type: "review", date: "April 13, 2026", time: "3:00 PM", duration: "45 min", instructor: "Prof. James Chen", colorClass: "bg-vibrant-mint" },
  { id: "6", title: "TypeScript Deep Dive", type: "session", date: "April 14, 2026", time: "3:00 PM", duration: "90 min", instructor: "Prof. James Chen", colorClass: "bg-vibrant-yellow" },
  { id: "7", title: "Component Library Due", type: "assignment", date: "April 18, 2026", time: "11:59 PM", duration: "—", instructor: "Dr. Elena Martinez", colorClass: "bg-vibrant-orange" },
];

export const dashboardStats = {
  totalStudents: 196,
  activeSessions: 3,
  completedThisWeek: 12,
  avgAttendance: 87,
};

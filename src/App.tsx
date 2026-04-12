import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createBrowserRouter, ScrollRestoration, Outlet } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import LiveSessions from "@/pages/LiveSessions";
import SessionDetail from "@/pages/SessionDetail";
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import CourseSessionDetail from "@/pages/CourseSessionDetail";
import Schedule from "@/pages/Schedule";
import Assignments from "@/pages/Assignments";
import Students from "@/pages/Students";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const Layout = () => (
  <>
    <ScrollRestoration />
    <Outlet />
  </>
);

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/", element: <Dashboard /> },
          { path: "/sessions", element: <LiveSessions /> },
          { path: "/sessions/:id", element: <SessionDetail /> },
          { path: "/schedule", element: <Schedule /> },
          { path: "/assignments", element: <Assignments /> },
          { path: "/students", element: <Students /> },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

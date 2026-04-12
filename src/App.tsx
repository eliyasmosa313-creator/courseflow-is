import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createBrowserRouter, ScrollRestoration, Outlet } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
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
import Auth from "@/pages/Auth";
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
      { path: "/auth", element: <Auth /> },
      {
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: "/", element: <Dashboard /> },
          {
            path: "/courses",
            element: (
              <ProtectedRoute allowedRoles={["instructor", "student"]}>
                <Courses />
              </ProtectedRoute>
            ),
          },
          {
            path: "/courses/:id",
            element: (
              <ProtectedRoute allowedRoles={["instructor", "student"]}>
                <CourseDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: "/courses/:courseId/sessions/:sessionId",
            element: (
              <ProtectedRoute allowedRoles={["instructor", "student"]}>
                <CourseSessionDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: "/sessions",
            element: (
              <ProtectedRoute allowedRoles={["instructor", "student"]}>
                <LiveSessions />
              </ProtectedRoute>
            ),
          },
          {
            path: "/sessions/:id",
            element: (
              <ProtectedRoute allowedRoles={["instructor", "student"]}>
                <SessionDetail />
              </ProtectedRoute>
            ),
          },
          {
            path: "/schedule",
            element: (
              <ProtectedRoute allowedRoles={["instructor", "student"]}>
                <Schedule />
              </ProtectedRoute>
            ),
          },
          {
            path: "/assignments",
            element: (
              <ProtectedRoute allowedRoles={["instructor", "student"]}>
                <Assignments />
              </ProtectedRoute>
            ),
          },
          {
            path: "/students",
            element: (
              <ProtectedRoute allowedRoles={["instructor"]}>
                <Students />
              </ProtectedRoute>
            ),
          },
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
      <AuthProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { Outlet } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        <main className="flex-1 px-5 md:px-8 py-6 md:py-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

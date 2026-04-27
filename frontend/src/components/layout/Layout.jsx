import { useState, createContext, useContext } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const AdminUsersContext = createContext();

export function useAdminUsers() {
  return useContext(AdminUsersContext);
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUsersExpanded, setAdminUsersExpanded] = useState(false);

  return (
    <AdminUsersContext.Provider value={{ adminUsersExpanded, setAdminUsersExpanded }}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:ml-64 flex flex-col min-h-screen overflow-hidden">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminUsersContext.Provider>
  );
}

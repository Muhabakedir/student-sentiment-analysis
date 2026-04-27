import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Server, MessageSquare,
  Tag, Lightbulb, GraduationCap, X, Users,
} from "lucide-react";

const navItems = {
  overview: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ],
  analytics: [
    { to: "/dashboard/services", label: "Services", icon: Server },
    { to: "/dashboard/themes", label: "Themes", icon: Tag },
  ],
  feedback: [
    { to: "/dashboard/feedback", label: "Feedback", icon: MessageSquare },
    { to: "/dashboard/recommendations", label: "Recommendations", icon: Lightbulb },
  ],
  people: [
    { to: "/dashboard/students", label: "Students", icon: Users },
  ],
};

export default function Sidebar({ open, onClose }) {
  const { isSuperAdmin } = useAuth();
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 z-30
        bg-white dark:from-black dark:to-black
        border-r border-gray-200 dark:border-gray-800
        flex flex-col
        transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-sm shadow-violet-500/30">
              <GraduationCap size={19} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-300 leading-tight">UniFeedback</p>
              <p className="text-xs text-gray-500 dark:text-gray-600">Analysis System</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {/* Overview */}
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-3 mb-2">
            Overview
          </p>
          {navItems.overview.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${isActive
                  ? "bg-violet-50 text-violet-700 dark:bg-gray-800 dark:text-gray-300"
                  : "text-gray-600 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-300"
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}

          {/* Analytics */}
          <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-3 mb-2">
              Analytics
            </p>
            {navItems.analytics.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${isActive
                    ? "bg-violet-50 text-violet-700 dark:bg-gray-800 dark:text-gray-300"
                    : "text-gray-600 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-300"
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </div>

          {/* Feedback */}
          <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-3 mb-2">
              Feedback
            </p>
            {navItems.feedback.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${isActive
                    ? "bg-violet-50 text-violet-700 dark:bg-gray-800 dark:text-gray-300"
                    : "text-gray-600 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-300"
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </div>

          {/* People */}
          <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-3 mb-2">
              People
            </p>
            {navItems.people.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${isActive
                    ? "bg-violet-50 text-violet-700 dark:bg-gray-800 dark:text-gray-300"
                    : "text-gray-600 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-300"
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </div>

          {/* Administration */}
          <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-3 mb-2">
              Administration
            </p>
            {isSuperAdmin && (
              <NavLink
                to="/dashboard/users"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${isActive
                    ? "bg-violet-50 text-violet-700 dark:bg-gray-800 dark:text-gray-300"
                    : "text-gray-600 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-300"
                  }`
                }
              >
                <Users size={17} />
                Admin Users
              </NavLink>
            )}
            {!isSuperAdmin && (
              <p className="px-3 py-2 text-xs text-gray-400 dark:text-gray-600 italic">
                Contact superadmin to manage users
              </p>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-400 dark:text-gray-600">© 2026 University Admin</p>
          <p className="text-xs text-gray-500 dark:text-gray-700 mt-0.5">v2.0 — BERT Powered</p>
        </div>
      </aside>
    </>
  );
}

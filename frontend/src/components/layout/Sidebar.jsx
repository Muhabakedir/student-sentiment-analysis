import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Server, MessageSquare,
  Tag, Lightbulb, GraduationCap, X, Users,
} from "lucide-react";

const navItems = [
  { to: "/dashboard",                 label: "Dashboard",       icon: LayoutDashboard },
  { to: "/dashboard/services",        label: "Services",        icon: Server },
  { to: "/dashboard/feedback",        label: "Feedback",        icon: MessageSquare },
  { to: "/dashboard/themes",          label: "Themes",          icon: Tag },
  { to: "/dashboard/recommendations", label: "Recommendations", icon: Lightbulb },
];

export default function Sidebar({ open, onClose }) {
  const { isSuperAdmin } = useAuth();
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 z-30
        bg-gradient-to-b from-violet-950 to-indigo-950 dark:from-violet-950 dark:to-indigo-950
        border-r border-violet-500/20 dark:border-violet-500/20
        flex flex-col
        transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-violet-500/20 dark:border-violet-500/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-sm shadow-violet-500/30">
              <GraduationCap size={19} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white dark:text-white leading-tight">UniFeedback</p>
              <p className="text-xs text-slate-400 dark:text-slate-400">Analysis System</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-violet-500/20 dark:hover:bg-violet-500/20 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
            Analytics
          </p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${isActive
                  ? "bg-violet-500/20 dark:bg-violet-500/20 text-violet-400 dark:text-violet-400"
                  : "text-slate-400 dark:text-slate-400 hover:bg-violet-500/20 dark:hover:bg-violet-500/20 hover:text-slate-200 dark:hover:text-slate-200"
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}

          <div className="pt-4 mt-2 border-t border-violet-500/20 dark:border-violet-500/20">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
              Administration
            </p>
            {isSuperAdmin && (
              <NavLink
                to="/dashboard/users"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${isActive
                    ? "bg-violet-500/20 dark:bg-violet-500/20 text-violet-400 dark:text-violet-400"
                    : "text-slate-400 dark:text-slate-400 hover:bg-violet-500/20 dark:hover:bg-violet-500/20 hover:text-slate-200 dark:hover:text-slate-200"
                  }`
                }
              >
                <Users size={17} />
                Admin Users
              </NavLink>
            )}
            {!isSuperAdmin && (
              <p className="px-3 py-2 text-xs text-slate-500 dark:text-slate-500 italic">
                Contact superadmin to manage users
              </p>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-violet-500/20 dark:border-violet-500/20">
          <p className="text-xs text-slate-500 dark:text-slate-500">© 2026 University Admin</p>
          <p className="text-xs text-slate-600 dark:text-slate-600 mt-0.5">v2.0 — BERT Powered</p>
        </div>
      </aside>
    </>
  );
}

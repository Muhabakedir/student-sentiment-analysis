import { Menu, Sun, Moon, LogOut, Crown } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

const pageTitles = {
  "/dashboard":                 { title: "Dashboard", sub: "Overview & analytics" },
  "/dashboard/services":        { title: "Service Analysis", sub: "Per-service sentiment breakdown" },
  "/dashboard/feedback":        { title: "Feedback Explorer", sub: "Browse and filter all submissions" },
  "/dashboard/themes":          { title: "Themes", sub: "Issue topics and trends" },
  "/dashboard/recommendations": { title: "Recommendations", sub: "Action items based on feedback" },
  "/dashboard/users":           { title: "Admin Users", sub: "Manage administrator accounts" },
};

export default function Navbar({ onMenuClick }) {
  const { darkMode, setDarkMode } = useTheme();
  const { email, logout, isSuperAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const page = pageTitles[location.pathname] || { title: "Dashboard", sub: "" };
  const initials = email ? email.slice(0, 2).toUpperCase() : "AD";

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <header className="sticky top-0 z-10 bg-gradient-to-r from-indigo-950/95 to-purple-950/95 dark:from-indigo-950/95 dark:to-purple-950/95 border-b border-violet-500/20 dark:border-violet-500/20 px-4 lg:px-6 py-3.5 flex items-center justify-between backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:bg-violet-500/20 dark:hover:bg-violet-500/20 dark:text-slate-400 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-base font-semibold text-white dark:text-white leading-tight">{page.title}</h1>
          {page.sub && (
            <p className="text-xs text-slate-400 dark:text-slate-400 hidden sm:block mt-0.5">{page.sub}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-xl border transition-all
            ${darkMode
              ? "bg-violet-900/40 border-violet-500/30 text-yellow-400 hover:bg-violet-500/20"
              : "bg-violet-900/30 border-violet-500/30 text-slate-300 hover:bg-violet-500/20"
            }`}
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Admin profile + logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-violet-500/20 dark:border-violet-500/20 ml-1">
          <div className="hidden sm:block text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <p className="text-xs font-medium text-slate-300 dark:text-slate-300 leading-tight">{email || "Admin"}</p>
              {isSuperAdmin && (
                <span title="Superadmin">
                  <Crown size={12} className="text-yellow-500" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-400">
              {isSuperAdmin ? "Superadmin" : "Administrator"}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 dark:hover:bg-rose-500/20 transition-colors"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

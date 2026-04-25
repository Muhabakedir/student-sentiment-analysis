import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GraduationCap, Eye, EyeOff, Sun, Moon, ArrowRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import API from "../config";

export default function Login() {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useTheme();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const id   = identifier.trim();
    const pass = password.trim();

    // Detect role by identifier format:
    // - Contains "@" → treat as admin email
    // - Otherwise → treat as student ID
    const isAdminAttempt = id.includes("@");

    try {
      if (isAdminAttempt) {
        // ── Admin login via backend JWT ──────────────────
        const res = await fetch(`${API}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: id, password: pass }),
        });

        if (res.ok) {
          const data = await res.json();
          login(data.access_token, data.email, data.is_superadmin);
          navigate("/dashboard");
        } else {
          const err = await res.json();
          setError(err.detail || "Invalid email or password.");
        }
      } else {
        // ── Student login via backend ──────────────────
        const res = await fetch(`${API}/api/auth/student-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ student_id: id, password: pass }),
        });

        if (res.ok) {
          const data = await res.json();
          sessionStorage.setItem("token", data.access_token);
          sessionStorage.setItem("student", JSON.stringify(data));
          navigate("/student/portal");
        } else {
          const err = await res.json();
          setError(err.detail || "Invalid Student ID or password.");
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          <GraduationCap size={18} className="text-indigo-600 dark:text-indigo-400" />
          UniFeedback
        </Link>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-xl border transition-all
            ${darkMode ? "bg-gray-800 border-gray-700 text-yellow-400 hover:bg-gray-700" : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200"}`}
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">

            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg mb-4">
                <GraduationCap size={26} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Welcome to UniFeedback</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
                Sign in with your Student ID 
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Student ID 
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="STU2024001"
                  autoComplete="username"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors placeholder-gray-400"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>Sign In <ArrowRight size={15} /></>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
              New student?{" "}
              <Link to="/student/register" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                Create an account
              </Link>
            </p>
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
              Forgot password?{" "}
              <Link to="/admin/forgot-password" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                Admin
              </Link>
              {" | "}
              <Link to="/student/forgot-password" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                Student
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Shield, Eye, EyeOff, CheckCircle, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import API from "../config";

export default function AdminActivate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { darkMode, setDarkMode } = useTheme();

  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!token) {
      setError("Invalid or missing activation token. Please check your email link.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/activate-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.detail || "Activation failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 dark:from-indigo-950 dark:via-purple-950 dark:to-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4">
        <Link to="/login" className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-400 hover:text-violet-400 dark:hover:text-violet-400 transition-colors">
          <Shield size={18} className="text-violet-400 dark:text-violet-400" />
          UniFeedback
        </Link>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-xl border transition-all
            ${darkMode ? "bg-violet-900/40 border-violet-500/30 text-yellow-400 hover:bg-violet-500/20" : "bg-violet-900/30 border-violet-500/30 text-slate-300 hover:bg-violet-500/20"}`}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-gradient-to-br from-violet-900/60 to-indigo-900/50 dark:from-violet-900/60 dark:to-indigo-900/50 rounded-3xl shadow-xl border border-violet-500/30 dark:border-violet-500/30 p-8 backdrop-blur-xl">
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30 mb-4">
                <Shield size={26} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-white dark:text-white">Activate Your Account</h1>
              <p className="text-sm text-slate-400 dark:text-slate-400 mt-1 text-center">
                Set your password to complete admin account activation
              </p>
            </div>

            {success ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-emerald-500/15 dark:bg-emerald-500/15 border border-emerald-500/30 dark:border-emerald-500/30 rounded-2xl p-4">
                  <CheckCircle className="w-6 h-6 text-emerald-400 dark:text-emerald-400" />
                  <div>
                    <p className="text-emerald-400 dark:text-emerald-400 font-medium">Account activated!</p>
                    <p className="text-emerald-400/80 dark:text-emerald-400/80 text-sm">You can now log in with your email and password.</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors"
                >
                  Go to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {!token && (
                  <div className="bg-amber-500/15 dark:bg-amber-500/15 border border-amber-500/30 dark:border-amber-500/30 rounded-xl px-4 py-3 text-xs text-amber-400 dark:text-amber-400">
                    No activation token found. Please check your email for the correct link.
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-violet-500/30 dark:border-violet-500/30 bg-violet-900/30 dark:bg-violet-900/30 text-slate-200 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 dark:hover:text-slate-200">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1.5">Confirm Password</label>
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-2.5 rounded-xl border border-violet-500/30 dark:border-violet-500/30 bg-violet-900/30 dark:bg-violet-900/30 text-slate-200 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
                  />
                </div>

                {error && (
                  <div className="text-xs text-rose-400 dark:text-rose-400 bg-rose-500/15 dark:bg-rose-500/15 border border-rose-500/30 dark:border-rose-500/30 rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Activating...
                    </>
                  ) : "Activate Account"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

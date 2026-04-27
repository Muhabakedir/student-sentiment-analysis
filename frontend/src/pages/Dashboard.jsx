import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useAdminUsers } from "../components/layout/Layout";
import { useLiveData } from "../hooks/useLiveData";
import {
  MessageSquare, ThumbsUp, ThumbsDown, Minus,
  TrendingUp, TrendingDown, AlertTriangle, Activity,
  ChevronDown, ChevronUp,
} from "lucide-react";
import StatCard from "../components/ui/StatCard";
import SentimentPieChart from "../components/charts/SentimentPieChart";
import FeedbackBarChart from "../components/charts/FeedbackBarChart";
import SentimentBadge from "../components/ui/SentimentBadge";
import DateRangePicker from "../components/ui/DateRangePicker";
import API from "../config";
import { SkeletonCard, SkeletonChart } from "../components/ui/Skeleton";

export default function Dashboard() {
  const [dates, setDates] = useState({ dateFrom: "", dateTo: "" });
  const { adminUsersExpanded, setAdminUsersExpanded } = useAdminUsers();
  const { feedback, stats, serviceStats, loading, isLive } = useLiveData(dates);

  const mostNegativeService = useMemo(() => {
    if (!serviceStats.length) return null;
    return serviceStats.reduce((prev, curr) => curr.negative > prev.negative ? curr : prev);
  }, [serviceStats]);

  const mostPositiveService = useMemo(() => {
    if (!serviceStats.length) return null;
    return serviceStats.reduce((prev, curr) => curr.positive > prev.positive ? curr : prev);
  }, [serviceStats]);

  const mostReportedTheme = useMemo(() => {
    const map = {};
    feedback.forEach(({ theme }) => { map[theme] = (map[theme] || 0) + 1; });
    const entries = Object.entries(map);
    return entries.length ? entries.sort((a, b) => b[1] - a[1])[0] : null;
  }, [feedback]);

  const recentFeedback = useMemo(() => feedback.slice(0, 6), [feedback]);
  const pct = (n) => stats.total ? `${((n / stats.total) * 100).toFixed(1)}%` : "0%";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonChart /><SkeletonChart />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="p-4 sm:p-6 lg:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >

      <div className="relative z-10 space-y-6 max-w-full mx-auto">
        {/* Status Bar */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-900 rounded-2xl px-6 py-4 border border-gray-200 dark:border-gray-800 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full
              ${isLive
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
              }`}>
              <span className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              {isLive ? "Live" : "Offline"}
            </div>
            {isLive && (
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {stats.total.toLocaleString()} submissions
              </span>
            )}
          </div>
          <DateRangePicker dateFrom={dates.dateFrom} dateTo={dates.dateTo} onChange={setDates} />
        </motion.div>

        {/* KPI Cards Row */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard
            label="Total Feedback"
            value={stats.total.toLocaleString()}
            icon={MessageSquare}
            color="indigo"
            sub="All services combined"
          />
          <StatCard
            label="Positive"
            value={pct(stats.positive)}
            icon={ThumbsUp}
            color="green"
            sub={`${stats.positive.toLocaleString()} responses`}
          />
          <StatCard
            label="Neutral"
            value={pct(stats.neutral)}
            icon={Minus}
            color="yellow"
            sub={`${stats.neutral.toLocaleString()} responses`}
          />
          <StatCard
            label="Negative"
            value={pct(stats.negative)}
            icon={ThumbsDown}
            color="red"
            sub={`${stats.negative.toLocaleString()} responses`}
          />
        </motion.div>

        {/* Main Content - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left - Charts */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-200">Sentiment Distribution</h2>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Overall breakdown across all services</p>
              </div>
              <div className="p-6">
                <SentimentPieChart data={stats} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-200">Feedback per Service</h2>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Sentiment breakdown by university service</p>
              </div>
              <div className="p-6">
                <FeedbackBarChart data={serviceStats} />
              </div>
            </div>
          </div>

          {/* Right - Insights + Recent Feedback */}
          <div className="space-y-6">
            {/* Key Insights */}
            {(mostPositiveService || mostNegativeService || mostReportedTheme) && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-200">Key Insights</h2>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {mostPositiveService && mostPositiveService.positive > 0 && (
                    <div className="px-6 py-4 flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl shrink-0">
                        <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">Highest Satisfaction</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate">{mostPositiveService.service}</p>
                      </div>
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg">
                        {mostPositiveService.positive} positive
                      </span>
                    </div>
                  )}
                  {mostNegativeService && mostNegativeService.negative > 0 && (
                    <div className="px-6 py-4 flex items-center gap-3">
                      <div className="p-2.5 bg-rose-100 dark:bg-rose-900/40 rounded-xl shrink-0">
                        <TrendingDown size={18} className="text-rose-600 dark:text-rose-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">Most Negative Service</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate">{mostNegativeService.service}</p>
                      </div>
                      <span className="text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30 px-3 py-1.5 rounded-lg">
                        {mostNegativeService.negative} negative
                      </span>
                    </div>
                  )}
                  {mostReportedTheme && (
                    <div className="px-6 py-4 flex items-center gap-3">
                      <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 rounded-xl shrink-0">
                        <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">Most Reported Issue</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate">{mostReportedTheme[0]}</p>
                      </div>
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-lg">
                        {mostReportedTheme[1]} mentions
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Feedback */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-200 flex items-center gap-2">
                    <Activity size={16} className="text-violet-500 dark:text-gray-500" />
                    Recent Feedback
                  </h2>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                  Last {recentFeedback.length}
                </span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto">
                {recentFeedback.length === 0 ? (
                  <p className="px-6 py-8 text-center text-xs text-gray-400 dark:text-gray-500">
                    No feedback submitted yet.
                  </p>
                ) : (
                  recentFeedback.map((item, i) => (
                    <div key={item.id ?? i} className="px-6 py-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 dark:text-gray-300 line-clamp-1">{item.text}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2.5 py-1 rounded-lg">
                            {item.service}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg">{item.theme}</span>
                        </div>
                      </div>
                      <div className="shrink-0 pt-0.5">
                        <SentimentBadge sentiment={item.sentiment} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Admin Users Section */}
        <AnimatePresence>
          {adminUsersExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 mt-6 shadow-sm">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-violet-50 dark:bg-violet-900/20">
                  <div>
                    <h2 className="text-sm font-semibold text-violet-700 dark:text-violet-300 flex items-center gap-2">
                      Admin Users
                    </h2>
                    <p className="text-xs text-violet-600 dark:text-violet-400 mt-0.5">Manage administrator accounts</p>
                  </div>
                  <button
                    onClick={() => setAdminUsersExpanded(false)}
                    className="p-2 rounded-xl text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors"
                  >
                    <ChevronUp size={18} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <AdminUsersContent onClose={() => setAdminUsersExpanded(false)} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Admin Users Content Component
function AdminUsersContent({ onClose }) {
  const { token, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [resetRequests, setResetRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: "", is_superadmin: false });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adding, setAdding] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [setPassModal, setSetPassModal] = useState(null);
  const [settingPass, setSettingPass] = useState(false);

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const flash = (type, msg) => {
    if (type === "success") { setSuccess(msg); setTimeout(() => setSuccess(""), 4000); }
    else { setError(msg); setTimeout(() => setError(""), 4000); }
  };

  const fetchAll = async () => {
    try {
      const [usersRes, resetRes] = await Promise.all([
        fetch(`${API}/api/admin/users`, { headers }),
        fetch(`${API}/api/admin/reset-requests`, { headers }),
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (resetRes.ok) setResetRequests(await resetRes.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const r = await fetch(`${API}/api/admin/users`, {
        method: "POST", headers,
        body: JSON.stringify({ email: form.email.trim(), is_superadmin: form.is_superadmin }),
      });
      if (r.ok) {
        flash("success", `Admin ${form.email} created.`);
        setForm({ email: "", is_superadmin: false });
        fetchAll();
      } else {
        const d = await r.json();
        flash("error", d.detail || "Failed to create admin.");
      }
    } catch { flash("error", "Cannot connect to backend."); }
    finally { setAdding(false); }
  };

  const handleToggle = async (id, email) => {
    try {
      const r = await fetch(`${API}/api/admin/users/${id}/toggle`, { method: "PATCH", headers });
      if (r.ok) {
        const d = await r.json();
        flash("success", `${email} is now ${d.is_active ? "active" : "inactive"}.`);
        fetchAll();
      } else {
        const d = await r.json();
        flash("error", d.detail || "Failed to update.");
      }
    } catch { flash("error", "Cannot connect to backend."); }
  };

  const handleDelete = async (id, email) => {
    if (!confirm(`Permanently delete admin ${email}?`)) return;
    try {
      const r = await fetch(`${API}/api/admin/users/${id}`, { method: "DELETE", headers });
      if (r.ok) { flash("success", `${email} deleted.`); fetchAll(); }
      else { const d = await r.json(); flash("error", d.detail || "Failed to delete."); }
    } catch { flash("error", "Cannot connect to backend."); }
  };

  const handleSetPassword = async () => {
    setSettingPass(true);
    try {
      const r = await fetch(`${API}/api/admin/users/${setPassModal.id}/set-password`, {
        method: "PATCH", headers,
      });
      if (r.ok) {
        const d = await r.json();
        flash("success", d.message);
        setSetPassModal(null);
        fetchAll();
      } else {
        const d = await r.json();
        flash("error", d.detail || "Failed to trigger reset.");
      }
    } catch { flash("error", "Cannot connect to backend."); }
    finally { setSettingPass(false); }
  };

  const handleReanalyze = async () => {
    if (!confirm("Re-analyze ALL feedback with current sentiment model? This may take a moment.")) return;
    setReanalyzing(true);
    try {
      const r = await fetch(`${API}/api/admin/reanalyze`, {
        method: "POST", headers,
      });
      if (r.ok) {
        const d = await r.json();
        flash("success", d.message);
      } else {
        const d = await r.json();
        flash("error", d.detail || "Failed to re-analyze feedback.");
      }
    } catch { flash("error", "Cannot connect to backend."); }
    finally { setReanalyzing(false); }
  };

  const hasPendingReset = (email) => resetRequests.some(r => r.email === email);

  if (!isSuperAdmin) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Superadmin Access Required</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Only the superadmin can manage administrator accounts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {resetRequests.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-300">{resetRequests.length} pending password reset request{resetRequests.length > 1 ? "s" : ""}</p>
        </div>
      )}

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Add New Admin</h3>
        <form onSubmit={handleAdd} className="space-y-3">
          <input type="email" required value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="newadmin@university.edu"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
          />
          <button type="submit" disabled={adding}
            className="w-full px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors disabled:opacity-60">
            {adding ? "Adding..." : "Add Admin"}
          </button>
        </form>
        {error && <p className="mt-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-lg px-3 py-2">{error}</p>}
        {success && <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2">{success}</p>}
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Admin List ({users.length})</h3>
        {loading ? (
          <div className="text-center text-xs text-gray-400 dark:text-gray-600 py-4">Loading...</div>
        ) : (
          <div className="space-y-2">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between gap-3 px-3 py-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{user.email}</span>
                  {user.is_superadmin && (
                    <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded font-medium shrink-0">Superadmin</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${user.is_active ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400" : "bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-600"}`}>
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                  <button onClick={() => handleToggle(user.id, user.email)} className="p-1 rounded text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    {user.is_active ? "✓" : "○"}
                  </button>
                  <button onClick={() => handleDelete(user.id, user.email)} className="p-1 rounded text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {setPassModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-5 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-300">Trigger Password Reset</h3>
              <button onClick={() => setSetPassModal(null)} className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">✕</button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">Send password reset link to {setPassModal.email}?</p>
            <div className="flex gap-2">
              <button onClick={() => setSetPassModal(null)} className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
              <button onClick={handleSetPassword} disabled={settingPass} className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors disabled:opacity-60">{settingPass ? "Sending..." : "Send"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

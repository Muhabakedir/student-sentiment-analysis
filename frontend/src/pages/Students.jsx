import { useState, useEffect } from "react";
import { Users, UserCheck, Shield } from "lucide-react";
import API from "../config";

export default function Students() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [activeStudents, setActiveStudents] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    try {
      const res = await fetch(`${API}/api/stats`);
      if (res.ok) {
        const stats = await res.json();
        setTotalStudents(stats.total_students || 0);
        setFeedbackCount(stats.students_with_feedback || 0);
      }
      const studentsRes = await fetch(`${API}/api/admin/students`);
      if (studentsRes.ok) {
        const students = await studentsRes.json();
        setActiveStudents(students.filter((s) => s.is_active).length);
      }
    } catch (e) {
      setError("Failed to load student data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-4">Students</h1>

      {error && (
        <div className="mb-4 p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
              <Users className="text-violet-600 dark:text-violet-400" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Registered Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalStudents}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
              <Shield className="text-sky-600 dark:text-sky-400" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Active Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeStudents}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <UserCheck className="text-emerald-600 dark:text-emerald-400" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Students Gave Feedback</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{feedbackCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy notice */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="text-violet-600 dark:text-gray-500" size={18} />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-200">Privacy Protected</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Student identities are kept anonymous. No personal information such as names, emails, or student IDs are displayed to protect privacy.
          Feedback submissions are linked only via hashed session identifiers.
        </p>
      </div>
    </div>
  );
}

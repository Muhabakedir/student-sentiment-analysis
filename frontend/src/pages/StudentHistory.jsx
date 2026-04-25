import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Sun, Moon, LogOut, Clock, CheckCircle } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import SentimentBadge from "../components/ui/SentimentBadge";
import API from "../config";

// Get or create a persistent anonymous session ID
function getSessionId() {
  let id = localStorage.getItem("student_session_id")
        || sessionStorage.getItem("student_session_id");
  if (!id) {
    id = "sess_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
  localStorage.setItem("student_session_id", id);
  sessionStorage.setItem("student_session_id", id);
  return id;
}

export default function StudentHistory() {
  const { darkMode, setDarkMode } = useTheme();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = getSessionId();
    fetch(`${API}/api/student/history?session_id=${sessionId}`)
      .then(r => r.ok ? r.json() : [])
      .catch(() => [])
      .then(data => { setHistory(data); setLoading(false); });
  }, []);

  const sentimentColor = {
    positive: "text-green-600 dark:text-green-400",
    neutral:  "text-yellow-600 dark:text-yellow-400",
    negative: "text-red-600 dark:text-red-400",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">My Feedback History</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Anonymous submissions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl border transition-all
              ${darkMode ? "bg-gray-800 border-gray-700 text-yellow-400 hover:bg-gray-700" : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"}`}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => navigate("/student/portal")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            + New Feedback
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem("token");
              sessionStorage.removeItem("student");
              localStorage.removeItem("student_session_id");
              navigate("/");
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        {/* Privacy note */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl px-5 py-4 mb-6 flex gap-3">
          <span className="text-base">🔒</span>
          <p className="text-xs text-indigo-600 dark:text-indigo-400">
            Your feedback is completely anonymous. This history is stored only in your browser session — no personal data is linked to your submissions.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-white dark:bg-gray-900 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-800" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-10 text-center border border-gray-100 dark:border-gray-800">
            <Clock size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No feedback submitted yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 mb-5">
              Your submissions will appear here after you submit feedback.
            </p>
            <button
              onClick={() => navigate("/student/portal")}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
            >
              Submit Feedback
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              {history.length} submission{history.length !== 1 ? "s" : ""} from this device
            </p>
            {history.map((item, i) => (
              <div key={item.id ?? i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-lg">
                      {item.service}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">{item.theme}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <SentimentBadge sentiment={item.sentiment} />
                    {item.confidence > 0 && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {(item.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{item.text}</p>
                <div className="flex items-center gap-2 mt-3">
                  <CheckCircle size={12} className="text-green-500" />
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Submitted {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="text-center py-4 text-xs text-gray-400 dark:text-gray-600 border-t border-gray-100 dark:border-gray-800">
        © 2026 UniFeedback — University Student Feedback Analysis System
      </footer>
    </div>
  );
}

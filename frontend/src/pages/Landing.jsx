import { useNavigate } from "react-router-dom";
import { GraduationCap, Sun, Moon, BarChart3, MessageSquare, Lightbulb, Shield, ArrowRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const features = [
  { icon: MessageSquare, title: "Collect Feedback", desc: "Students submit feedback anonymously on any university service.", color: "indigo" },
  { icon: BarChart3,     title: "Analyze Sentiment", desc: "BERT model automatically classifies feedback as positive, neutral, or negative.", color: "green" },
  { icon: Lightbulb,     title: "Get Insights", desc: "Identify problem areas, trending issues, and service performance at a glance.", color: "yellow" },
  { icon: Shield,        title: "Secure Admin", desc: "JWT-protected dashboard with full analytics, exports, and user management.", color: "red" },
];

const colorMap = {
  indigo: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400",
  green:  "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400",
  yellow: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400",
  red:    "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
};

export default function Landing() {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex flex-col">
      {/* Navbar */}
      <header className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
            <GraduationCap size={21} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Feedback</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Analysis System</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl border transition-all
              ${darkMode ? "bg-gray-800 border-gray-700 text-yellow-400 hover:bg-gray-700" : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200"}`}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
          >
            Login
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 max-w-5xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
          Powered by RoBERTa BERT
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white max-w-3xl leading-tight mb-5">Haramaya University Student Feedback{" "}
          <span className="text-indigo-600 dark:text-indigo-400">Analysis</span>{" "}
          System
        </h1>

        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mb-10 leading-relaxed">
          Collect anonymous student feedback, analyze sentiment with AI, and empower university administrators with real-time insights.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/50"
          >
            Sign In
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate("/login")}
            className="flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-2xl transition-all border border-indigo-200 dark:border-indigo-800"
          >
            Student Portal
          </button>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-8 mt-14 mb-16">
          {[
            { label: "Services Monitored", value: "6" },
            { label: "Feedback Themes", value: "38" },
            { label: "Sentiment Classes", value: "3" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 text-left hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[color]}`}>
                <Icon size={18} />
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white mb-1">{title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-400 dark:text-gray-600 border-t border-gray-100 dark:border-gray-800">
        © 2026 UniFeedback — University Student Feedback Analysis System
      </footer>
    </div>
  );
}

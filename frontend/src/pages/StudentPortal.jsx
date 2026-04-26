import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Sun, Moon, CheckCircle, LogOut, Clock } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import API from "../config";
import { SERVICES_LIST } from "../data/mockData";

const SERVICE_THEMES = {
  "Teaching/Learning Process": ["Clarity of instruction","Instructor support and interaction","Learning materials","Classroom/learning environment","Student engagement","Use of technology in teaching","Fairness of assessment","Practically supported teaching environment"],
  "Library Service": ["Availability of materials","Study space","Cleanliness","Staff behavior","Opening hours","Internet access"],
  "ICT / Internet Services": ["Internet speed","Network stability","Computer lab availability","Access to systems/platforms","Technical support","Equipment quality"],
  "Registrar & Records Services": ["System reliability","Waiting time","Staff support","Information clarity","Process speed","Error handling"],
  "Cafeteria Services": ["Food quality","Price","Hygiene","Waiting time","Variety of food","Seating space"],
  "Dormitory / Housing Services": ["Water availability","Cleanliness","Safety/security","Maintenance","Room space","Sanitation facilities"],
};

export default function StudentPortal() {
  const { darkMode, setDarkMode } = useTheme();
  const navigate = useNavigate();

  const student = JSON.parse(sessionStorage.getItem("student") || "{}");
  const studentName = student.name || "Student";

  const [form, setForm] = useState({ service: "", theme: "", text: "", email: "", sentiment: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const themes = form.service ? SERVICE_THEMES[form.service] || [] : [];
  
  const canSubmit = !loading && form.service !== "" && form.theme !== "" && form.text.trim().length > 0;

  const handleServiceChange = (service) => {
    setForm((prev) => ({ ...prev, service, theme: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      const sessionId = localStorage.getItem("student_session_id") || "sess_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("student_session_id", sessionId);
      const res = await fetch(`${API}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service: form.service, theme: form.theme, text: form.text, session_id: sessionId, email: form.email || null }),
      });
      const data = await res.json();
      setForm((prev) => ({ ...prev, sentiment: data?.sentiment || "unknown" }));
      setSubmitted(true);
    } catch (err) {
      console.error("Backend error:", err);
      setForm((prev) => ({ ...prev, sentiment: "unavailable" }));
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAnother = () => {
    setForm({ service: "", theme: "", text: "", email: "", sentiment: "" });
    setSubmitted(false);
  };

  const sentimentColor = {
    positive: "text-green-600 dark:text-green-400",
    neutral: "text-yellow-600 dark:text-yellow-400",
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
            <p className="text-sm font-bold text-gray-900 dark:text-white">Welcome, {studentName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Student Portal — UniFeedback</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/student/history")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Clock size={15} />
            My History
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl border transition-all
              ${darkMode
                ? "bg-gray-800 border-gray-700 text-yellow-400 hover:bg-gray-700"
                : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
              }`}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
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

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {submitted ? (
            /* Success */
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-10 text-center">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={32} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Feedback Submitted!
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                Sentiment analyzed automatically by the BERT model.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 text-left mb-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Service</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{form.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Theme</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{form.theme}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Sentiment</span>
                  <span className={`font-semibold capitalize ${sentimentColor[form.sentiment] || "text-gray-500"}`}>
                    {form.sentiment || "Analyzing..."}
                  </span>
                </div>
              </div>
              <button
                onClick={handleAnother}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
              >
                Submit Another Feedback
              </button>
            </div>
          ) : (
            /* Form */
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
              <div className="mb-7">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Submit Feedback</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Share your experience with any university service.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Service */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Service *
                  </label>
                  <select
                    required
                    value={form.service}
                    onChange={(e) => handleServiceChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select a service...</option>
                    {SERVICES_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Topic / Theme *
                  </label>
                  <select
                    required
                    value={form.theme}
                    onChange={(e) => setForm((prev) => ({ ...prev, theme: e.target.value }))}
                    disabled={!form.service}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select a topic...</option>
                    {themes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Feedback text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Your Feedback *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.text}
                    onChange={(e) => setForm((prev) => ({ ...prev, text: e.target.value }))}
                    placeholder="Describe your experience in detail..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none placeholder-gray-400"
                  />
                </div>

                {/* Email (optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email <span className="text-gray-400 font-normal">(optional — to receive confirmation)</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors placeholder-gray-400"
                  />
                </div>

                {/* ML note */}
                <div className="flex items-start gap-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl px-4 py-3">
                  <span className="text-base leading-none mt-0.5">🤖</span>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">
                    Sentiment is automatically assigned by the BERT model after submission.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`w-full py-3 rounded-xl text-white text-sm font-semibold transition-all shadow-sm ${
                    canSubmit 
                      ? "bg-indigo-600 hover:bg-indigo-700 cursor-pointer" 
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit Feedback"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-gray-400 dark:text-gray-600 border-t border-gray-100 dark:border-gray-800">
        2026 UniFeedback — University Student Feedback Analysis System
      </footer>
    </div>
  );
}
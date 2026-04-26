import { useMemo, useState } from "react";
import { useLiveData } from "../hooks/useLiveData";
import SentimentBadge from "../components/ui/SentimentBadge";
import { X } from "lucide-react";

export default function Themes() {
  const { feedback, themeStats, loading, isLive } = useLiveData();
  const [selectedTheme, setSelectedTheme] = useState(null);

  const themeData = useMemo(() => {
    if (themeStats.length > 0) return [...themeStats].sort((a, b) => b.total - a.total);
    const map = {};
    feedback.forEach(({ theme, sentiment }) => {
      if (!map[theme]) map[theme] = { theme, positive: 0, neutral: 0, negative: 0, total: 0 };
      if (map[theme][sentiment] !== undefined) map[theme][sentiment]++;
      map[theme].total++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [themeStats, feedback]);

  const themeFeedback = useMemo(() => {
    if (!selectedTheme) return [];
    return feedback.filter(f => f.theme === selectedTheme).slice(0, 20);
  }, [selectedTheme, feedback]);

  return (
    <div className="space-y-6">

      {/* Selected theme feedback panel */}
      {selectedTheme && (
        <div className="bg-gradient-to-br from-violet-900/40 to-indigo-900/30 dark:from-violet-900/40 dark:to-indigo-900/30 rounded-2xl shadow-lg border border-violet-500/20 dark:border-violet-500/20 backdrop-blur-xl">
          <div className="px-5 py-4 border-b border-violet-500/20 dark:border-violet-500/20 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-200 dark:text-slate-200">{selectedTheme}</h2>
              <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
                Showing up to 20 entries · {themeFeedback.length} found
              </p>
            </div>
            <button
              onClick={() => setSelectedTheme(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-violet-500/20 dark:hover:bg-violet-500/20 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="divide-y divide-violet-500/10 dark:divide-violet-500/10">
            {themeFeedback.length === 0 ? (
              <p className="px-5 py-8 text-sm text-center text-slate-400 dark:text-slate-400">
                No feedback found for this theme.
              </p>
            ) : (
              themeFeedback.map((item, i) => (
                <div key={item.id ?? i} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 hover:bg-violet-500/10 dark:hover:bg-violet-500/10 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 dark:text-slate-300">{item.text}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">{item.service}</p>
                  </div>
                  <SentimentBadge sentiment={item.sentiment} />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Themes table */}
      <div className="bg-gradient-to-br from-violet-900/40 to-indigo-900/30 dark:from-violet-900/40 dark:to-indigo-900/30 rounded-2xl shadow-lg border border-violet-500/20 dark:border-violet-500/20 backdrop-blur-xl">
        <div className="px-5 py-4 border-b border-violet-500/20 dark:border-violet-500/20 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-200 dark:text-slate-200">All Themes</h2>
            <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">Click a row to explore feedback</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full
              ${isLive
                ? "bg-emerald-500/20 dark:bg-emerald-500/20 text-emerald-400 dark:text-emerald-400"
                : "bg-amber-500/20 dark:bg-amber-500/20 text-amber-400 dark:text-amber-400"
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              {isLive ? "Live" : "Offline"}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 dark:text-slate-400 uppercase tracking-wider bg-violet-900/30 dark:bg-violet-900/30">
                <th className="px-5 py-3 font-medium">Theme</th>
                <th className="px-5 py-3 font-medium text-violet-400">Positive</th>
                <th className="px-5 py-3 font-medium text-cyan-400">Neutral</th>
                <th className="px-5 py-3 font-medium text-rose-400">Negative</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Distribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-500/10 dark:divide-violet-500/10">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-5 py-3">
                        <div className="h-3 bg-violet-500/20 dark:bg-violet-500/20 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                themeData.map(row => (
                  <tr
                    key={row.theme}
                    onClick={() => setSelectedTheme(row.theme === selectedTheme ? null : row.theme)}
                    className={`cursor-pointer transition-colors ${
                      selectedTheme === row.theme
                        ? "bg-violet-500/20 dark:bg-violet-500/20"
                        : "hover:bg-violet-500/10 dark:hover:bg-violet-500/10"
                    }`}
                  >
                    <td className="px-5 py-3 font-medium text-slate-300 dark:text-slate-300">
                      {row.theme}
                    </td>
                    <td className="px-5 py-3 text-violet-400 dark:text-violet-400">{row.positive}</td>
                    <td className="px-5 py-3 text-cyan-400 dark:text-cyan-400">{row.neutral}</td>
                    <td className="px-5 py-3 text-rose-400 dark:text-rose-400">{row.negative}</td>
                    <td className="px-5 py-3 text-slate-400 dark:text-slate-400 font-semibold">{row.total}</td>
                    <td className="px-5 py-3 w-36">
                      <div className="h-2 rounded-full overflow-hidden bg-violet-500/20 dark:bg-violet-500/20 flex">
                        <div className="bg-violet-400 h-full" style={{ width: `${(row.positive / row.total) * 100}%` }} />
                        <div className="bg-cyan-400 h-full" style={{ width: `${(row.neutral / row.total) * 100}%` }} />
                        <div className="bg-rose-400 h-full" style={{ width: `${(row.negative / row.total) * 100}%` }} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

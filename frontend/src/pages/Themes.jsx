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
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-200">{selectedTheme}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                Showing up to 20 entries · {themeFeedback.length} found
              </p>
            </div>
            <button
              onClick={() => setSelectedTheme(null)}
              className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {themeFeedback.length === 0 ? (
              <p className="px-6 py-8 text-sm text-center text-gray-400 dark:text-gray-500">
                No feedback found for this theme.
              </p>
            ) : (
              themeFeedback.map((item, i) => (
                <div key={item.id ?? i} className="px-6 py-4 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-300">{item.text}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{item.service}</p>
                  </div>
                  <SentimentBadge sentiment={item.sentiment} />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Themes table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-200">All Themes</h2>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Click a row to explore feedback</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full
              ${isLive
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
              }`}>
              <span className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              {isLive ? "Live" : "Offline"}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-800">
                <th className="px-6 py-3 font-medium">Theme</th>
                <th className="px-6 py-3 font-medium text-emerald-600 dark:text-emerald-400">Positive</th>
                <th className="px-6 py-3 font-medium text-amber-600 dark:text-amber-400">Neutral</th>
                <th className="px-6 py-3 font-medium text-rose-600 dark:text-rose-400">Negative</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Distribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-6 py-3">
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
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
                        ? "bg-violet-50 dark:bg-gray-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <td className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300">
                      {row.theme}
                    </td>
                    <td className="px-6 py-3 text-emerald-600 dark:text-emerald-400">{row.positive}</td>
                    <td className="px-6 py-3 text-amber-600 dark:text-amber-400">{row.neutral}</td>
                    <td className="px-6 py-3 text-rose-600 dark:text-rose-400">{row.negative}</td>
                    <td className="px-6 py-3 text-gray-500 dark:text-gray-500 font-semibold">{row.total}</td>
                    <td className="px-6 py-3 w-40">
                      <div className="h-2.5 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex">
                        <div className="bg-emerald-400 h-full" style={{ width: `${(row.positive / row.total) * 100}%` }} />
                        <div className="bg-amber-400 h-full" style={{ width: `${(row.neutral / row.total) * 100}%` }} />
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

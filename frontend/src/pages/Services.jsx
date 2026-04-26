import { useMemo, useState, useEffect } from "react";
import { useLiveData } from "../hooks/useLiveData";
import Select from "../components/ui/Select";
import SentimentPieChart from "../components/charts/SentimentPieChart";
import { SkeletonChart, SkeletonCard } from "../components/ui/Skeleton";
import { MessageSquare, TrendingDown, Hash } from "lucide-react";
import { SERVICES_LIST } from "../data/mockData";

export default function Services() {
  const { feedback, serviceStats, loading, isLive } = useLiveData();

  const serviceNames = useMemo(
    () => [...new Set(feedback.map(f => f.service))].sort(),
    [feedback]
  );

  const [selectedService, setSelectedService] = useState("All Services");

  // Build dropdown options: "All Services" + all known services
  const dropdownOptions = useMemo(
    () => ["All Services", ...SERVICES_LIST],
    []
  );

  const filtered = useMemo(
    () => selectedService === "All Services" ? feedback : feedback.filter(f => f.service === selectedService),
    [feedback, selectedService]
  );

  const sentimentCounts = useMemo(() => {
    const counts = { positive: 0, neutral: 0, negative: 0 };
    filtered.forEach(f => { if (counts[f.sentiment] !== undefined) counts[f.sentiment]++; });
    return counts;
  }, [filtered]);

  const topNegativeThemes = useMemo(() => {
    const map = {};
    filtered.filter(f => f.sentiment === "negative")
      .forEach(({ theme }) => { map[theme] = (map[theme] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [filtered]);

  const themeBreakdown = useMemo(() => {
    const map = {};
    filtered.forEach(({ theme, sentiment }) => {
      if (!map[theme]) map[theme] = { theme, positive: 0, neutral: 0, negative: 0, total: 0 };
      if (map[theme][sentiment] !== undefined) map[theme][sentiment]++;
      map[theme].total++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filtered]);

  const pct = (n) => filtered.length ? `${((n / filtered.length) * 100).toFixed(1)}%` : "0%";

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <SkeletonChart />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live badge + selector */}
      <div className="bg-gradient-to-br from-violet-900/40 to-indigo-900/30 dark:from-violet-900/40 dark:to-indigo-900/30 rounded-2xl p-5 shadow-lg border border-violet-500/20 dark:border-violet-500/20 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full
            ${isLive
              ? "bg-emerald-500/20 dark:bg-emerald-500/20 text-emerald-400 dark:text-emerald-400"
              : "bg-amber-500/20 dark:bg-amber-500/20 text-amber-400 dark:text-amber-400"
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            {isLive ? "Live data from BERT model" : "Offline"}
          </span>
        </div>
        <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-2">
          Select Service
        </label>
        <Select
          value={selectedService}
          onChange={setSelectedService}
          options={dropdownOptions}
          className="w-full sm:w-80"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Feedback", value: filtered.length, icon: MessageSquare },
          { label: "Negative Feedback", value: `${sentimentCounts.negative} (${pct(sentimentCounts.negative)})`, icon: TrendingDown },
          { label: "Themes Covered", value: themeBreakdown.length, icon: Hash },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-gradient-to-br from-violet-900/40 to-indigo-900/30 dark:from-violet-900/40 dark:to-indigo-900/30 rounded-2xl p-5 shadow-lg border border-violet-500/20 dark:border-violet-500/20 backdrop-blur-xl">
            <p className="text-sm text-slate-400 dark:text-slate-400">{label}</p>
            <p className="text-2xl font-bold text-white dark:text-white mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="bg-gradient-to-br from-violet-900/40 to-indigo-900/30 dark:from-violet-900/40 dark:to-indigo-900/30 rounded-2xl p-5 shadow-lg border border-violet-500/20 dark:border-violet-500/20 backdrop-blur-xl">
          <h2 className="text-sm font-semibold text-slate-200 dark:text-slate-200 mb-4">Sentiment Breakdown</h2>
          <SentimentPieChart data={sentimentCounts} />
        </div>

        {/* Top Negative Themes */}
        <div className="bg-gradient-to-br from-violet-900/40 to-indigo-900/30 dark:from-violet-900/40 dark:to-indigo-900/30 rounded-2xl p-5 shadow-lg border border-violet-500/20 dark:border-violet-500/20 backdrop-blur-xl">
          <h2 className="text-sm font-semibold text-slate-200 dark:text-slate-200 mb-4">Top Negative Themes</h2>
          {topNegativeThemes.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-400 text-center py-8">No negative feedback for this service.</p>
          ) : (
            <div className="space-y-3">
              {topNegativeThemes.map(([theme, count]) => {
                const max = topNegativeThemes[0][1];
                return (
                  <div key={theme}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300 dark:text-slate-300 font-medium truncate mr-2">{theme}</span>
                      <span className="text-rose-400 font-semibold shrink-0">{count}</span>
                    </div>
                    <div className="h-2 bg-violet-500/20 dark:bg-violet-500/20 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-400 rounded-full transition-all duration-500"
                        style={{ width: `${(count / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Theme Breakdown Table */}
      <div className="bg-gradient-to-br from-violet-900/40 to-indigo-900/30 dark:from-violet-900/40 dark:to-indigo-900/30 rounded-2xl shadow-lg border border-violet-500/20 dark:border-violet-500/20 backdrop-blur-xl">
        <div className="px-5 py-4 border-b border-violet-500/20 dark:border-violet-500/20">
          <h2 className="text-sm font-semibold text-slate-200 dark:text-slate-200">Theme Breakdown</h2>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-500/10 dark:divide-violet-500/10">
              {themeBreakdown.map(row => (
                <tr key={row.theme} className="hover:bg-violet-500/10 dark:hover:bg-violet-500/10 transition-colors">
                  <td className="px-5 py-3 text-slate-300 dark:text-slate-300 font-medium">{row.theme}</td>
                  <td className="px-5 py-3 text-violet-400 dark:text-violet-400">{row.positive}</td>
                  <td className="px-5 py-3 text-cyan-400 dark:text-cyan-400">{row.neutral}</td>
                  <td className="px-5 py-3 text-rose-400 dark:text-rose-400">{row.negative}</td>
                  <td className="px-5 py-3 text-slate-400 dark:text-slate-400 font-semibold">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

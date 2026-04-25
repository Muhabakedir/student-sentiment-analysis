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
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full
            ${isLive
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`} />
            {isLive ? "Live data from BERT model" : "Offline"}
          </span>
        </div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
          <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Sentiment Breakdown</h2>
          <SentimentPieChart data={sentimentCounts} />
        </div>

        {/* Top Negative Themes */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Top Negative Themes</h2>
          {topNegativeThemes.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No negative feedback for this service.</p>
          ) : (
            <div className="space-y-3">
              {topNegativeThemes.map(([theme, count]) => {
                const max = topNegativeThemes[0][1];
                return (
                  <div key={theme}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300 font-medium truncate mr-2">{theme}</span>
                      <span className="text-red-500 font-semibold shrink-0">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full transition-all duration-500"
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Theme Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50">
                <th className="px-5 py-3 font-medium">Theme</th>
                <th className="px-5 py-3 font-medium text-green-600">Positive</th>
                <th className="px-5 py-3 font-medium text-yellow-600">Neutral</th>
                <th className="px-5 py-3 font-medium text-red-600">Negative</th>
                <th className="px-5 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {themeBreakdown.map(row => (
                <tr key={row.theme} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-3 text-gray-700 dark:text-gray-300 font-medium">{row.theme}</td>
                  <td className="px-5 py-3 text-green-600 dark:text-green-400">{row.positive}</td>
                  <td className="px-5 py-3 text-yellow-600 dark:text-yellow-400">{row.neutral}</td>
                  <td className="px-5 py-3 text-red-600 dark:text-red-400">{row.negative}</td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400 font-semibold">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

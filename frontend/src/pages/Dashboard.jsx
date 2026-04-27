import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare, ThumbsUp, Minus, ThumbsDown,
  AlertTriangle, TrendingDown, TrendingUp, Activity,
} from "lucide-react";
import { useLiveData } from "../hooks/useLiveData";
import StatCard from "../components/ui/StatCard";
import SentimentPieChart from "../components/charts/SentimentPieChart";
import FeedbackBarChart from "../components/charts/FeedbackBarChart";
import SentimentBadge from "../components/ui/SentimentBadge";
import DateRangePicker from "../components/ui/DateRangePicker";
import { SkeletonCard, SkeletonChart } from "../components/ui/Skeleton";

export default function Dashboard() {
  const [dates, setDates] = useState({ dateFrom: "", dateTo: "" });
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
          className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-900 rounded-lg px-5 py-3 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded
              ${isLive
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              {isLive ? "Live" : "Offline"}
            </div>
            {isLive && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {stats.total} total submissions
              </span>
            )}
          </div>
          <DateRangePicker dateFrom={dates.dateFrom} dateTo={dates.dateTo} onChange={setDates} />
        </motion.div>

        {/* KPI Cards Row */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
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
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-200">Sentiment Distribution</h2>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Overall breakdown across all services</p>
              </div>
              <div className="p-5">
                <SentimentPieChart data={stats} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-200">Feedback per Service</h2>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Sentiment breakdown by university service</p>
              </div>
              <div className="p-5">
                <FeedbackBarChart data={serviceStats} />
              </div>
            </div>
          </div>

          {/* Right - Insights + Recent Feedback */}
          <div className="space-y-6">
            {/* Key Insights */}
            {(mostPositiveService || mostNegativeService || mostReportedTheme) && (
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-200">Key Insights</h2>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {mostPositiveService && mostPositiveService.positive > 0 && (
                    <div className="px-5 py-3.5 flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg shrink-0">
                        <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">Highest Satisfaction</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate">{mostPositiveService.service}</p>
                      </div>
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded">
                        {mostPositiveService.positive} positive
                      </span>
                    </div>
                  )}
                  {mostNegativeService && mostNegativeService.negative > 0 && (
                    <div className="px-5 py-3.5 flex items-center gap-3">
                      <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-lg shrink-0">
                        <TrendingDown size={16} className="text-rose-600 dark:text-rose-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">Most Negative Service</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate">{mostNegativeService.service}</p>
                      </div>
                      <span className="text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30 px-2 py-1 rounded">
                        {mostNegativeService.negative} negative
                      </span>
                    </div>
                  )}
                  {mostReportedTheme && (
                    <div className="px-5 py-3.5 flex items-center gap-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg shrink-0">
                        <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">Most Reported Issue</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate">{mostReportedTheme[0]}</p>
                      </div>
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded">
                        {mostReportedTheme[1]} mentions
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Feedback */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-200 flex items-center gap-2">
                    <Activity size={14} className="text-violet-500 dark:text-gray-500" />
                    Recent Feedback
                  </h2>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  Last {recentFeedback.length}
                </span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto">
                {recentFeedback.length === 0 ? (
                  <p className="px-5 py-8 text-center text-xs text-gray-400 dark:text-gray-500">
                    No feedback submitted yet.
                  </p>
                ) : (
                  recentFeedback.map((item, i) => (
                    <div key={item.id ?? i} className="px-5 py-3 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 dark:text-gray-300 line-clamp-1">{item.text}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded">
                            {item.service}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{item.theme}</span>
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
      </div>
    </motion.div>
  );
}

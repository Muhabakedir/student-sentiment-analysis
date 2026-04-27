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
        {/* Header with status and date filter */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-black rounded-2xl px-6 py-4 shadow-sm border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full
              ${isLive
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
              }`}>
              <span className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              {isLive ? "Live — BERT model active" : "Offline"}
            </div>
            {isLive && (
              <span className="text-xs text-gray-600 dark:text-gray-500 bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800">
                {stats.total} total submissions
              </span>
            )}
          </div>
          <DateRangePicker dateFrom={dates.dateFrom} dateTo={dates.dateTo} onChange={setDates} />
        </motion.div>

        {/* Main Grid Layout - Side by Side */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - KPI Cards */}
          <motion.div variants={itemVariants} className="xl:col-span-1">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-3">Overview</h2>
            <div className="space-y-4">
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
            </div>
          </motion.div>

          {/* Middle Column - Charts */}
          <motion.div variants={itemVariants} className="xl:col-span-1 space-y-6">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-3">Charts</h2>
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-black rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-300">Sentiment Distribution</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">Overall breakdown</p>
                </div>
              </div>
              <SentimentPieChart data={stats} />
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-black rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-300">Feedback per Service</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">By university service</p>
                </div>
              </div>
              <FeedbackBarChart data={serviceStats} />
            </motion.div>
          </motion.div>

          {/* Right Column - Key Insights + Recent Feedback */}
          <motion.div variants={itemVariants} className="xl:col-span-1 space-y-6">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-3">Key Insights</h2>
            {(mostPositiveService || mostNegativeService || mostReportedTheme) && (
              <div className="space-y-3">
                {mostPositiveService && mostPositiveService.positive > 0 && (
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 shadow-sm"
                  >
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg shrink-0">
                      <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-0.5">
                        Best
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-emerald-300 truncate">
                        {mostPositiveService.service}
                      </p>
                    </div>
                  </motion.div>
                )}
                {mostNegativeService && mostNegativeService.negative > 0 && (
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl px-4 py-3 shadow-sm"
                  >
                    <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-lg shrink-0">
                      <TrendingDown size={16} className="text-rose-600 dark:text-rose-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold uppercase tracking-wider mb-0.5">
                        Worst
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-rose-300 truncate">
                        {mostNegativeService.service}
                      </p>
                    </div>
                  </motion.div>
                )}
                {mostReportedTheme && (
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 shadow-sm"
                  >
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg shrink-0">
                      <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider mb-0.5">
                        Top Issue
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-amber-300 truncate">
                        {mostReportedTheme[0]}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-3">Recent Feedback</h2>
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-300 flex items-center gap-2">
                    <Activity size={14} className="text-violet-500 dark:text-gray-500" />
                    Latest
                  </h2>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-600 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-800">
                  {recentFeedback.length}
                </span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-96 overflow-y-auto">
                {recentFeedback.length === 0 ? (
                  <p className="px-4 py-8 text-center text-xs text-gray-400 dark:text-gray-600">
                    No feedback submitted yet.
                  </p>
                ) : (
                  recentFeedback.map((item, i) => (
                    <motion.div
                      key={item.id ?? i}
                      whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)" }}
                      className="px-4 py-3 flex flex-col gap-2 transition-colors"
                    >
                      <p className="text-xs text-gray-800 dark:text-gray-300 line-clamp-2">{item.text}</p>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-md border border-violet-200 dark:border-violet-800">
                            {item.service}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-800">{item.theme}</span>
                        </div>
                        <SentimentBadge sentiment={item.sentiment} />
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

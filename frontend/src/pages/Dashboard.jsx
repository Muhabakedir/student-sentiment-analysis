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

      <div className="relative z-10 space-y-6 max-w-7xl mx-auto">
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

        {/* Overview Section */}
        <motion.div variants={itemVariants}>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-3">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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

        {/* Key Insights Section */}
        {(mostPositiveService || mostNegativeService || mostReportedTheme) && (
          <motion.div variants={itemVariants}>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-3">Key Insights</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {mostPositiveService && mostPositiveService.positive > 0 && (
              <motion.div 
                whileHover={{ y: -4 }}
                className="flex items-center gap-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-6 py-4 shadow-sm"
              >
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl shrink-0">
                  <TrendingUp size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-1">
                    Highest Satisfaction
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-emerald-300 truncate">
                    {mostPositiveService.service}
                  </p>
                  <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-1">
                    {mostPositiveService.positive} positive responses
                  </p>
                </div>
              </motion.div>
            )}
            {mostNegativeService && mostNegativeService.negative > 0 && (
              <motion.div 
                whileHover={{ y: -4 }}
                className="flex items-center gap-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl px-6 py-4 shadow-sm"
              >
                <div className="p-3 bg-rose-100 dark:bg-rose-900/40 rounded-xl shrink-0">
                  <TrendingDown size={20} className="text-rose-600 dark:text-rose-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold uppercase tracking-wider mb-1">
                    Most Negative Service
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-rose-300 truncate">
                    {mostNegativeService.service}
                  </p>
                  <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">
                    {mostNegativeService.negative} negative responses
                  </p>
                </div>
              </motion.div>
            )}
            {mostReportedTheme && (
              <motion.div 
                whileHover={{ y: -4 }}
                className="flex items-center gap-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl px-6 py-4 shadow-sm"
              >
                <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl shrink-0">
                  <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider mb-1">
                    Most Reported Issue
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-amber-300 truncate">
                    {mostReportedTheme[0]}
                  </p>
                  <p className="text-xs text-amber-500 dark:text-amber-400 mt-1">
                    {mostReportedTheme[1]} mentions
                  </p>
                </div>
              </motion.div>
            )}
          </div>
          </motion.div>
        )}

        {/* Charts Section */}
        <motion.div variants={itemVariants}>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-3">Charts</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-black rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-300">Sentiment Distribution</h2>
                <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">Overall breakdown across all services</p>
              </div>
            </div>
            <SentimentPieChart data={stats} />
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-black rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-300">Feedback per Service</h2>
                <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">Sentiment breakdown by university service</p>
              </div>
            </div>
            <FeedbackBarChart data={serviceStats} />
          </motion.div>
          </div>
        </motion.div>

        {/* Recent Feedback Section */}
        <motion.div variants={itemVariants}>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-3">Recent Feedback</h2>
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden"
          >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-300 flex items-center gap-2">
                <Activity size={18} className="text-violet-500 dark:text-gray-500" />
                Recent Feedback
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">Latest submissions with BERT sentiment</p>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-600 bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800">
              Last {recentFeedback.length}
            </span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentFeedback.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-gray-400 dark:text-gray-600">
                No feedback submitted yet. Students can submit via the Student Portal.
              </p>
            ) : (
              recentFeedback.map((item, i) => (
                <motion.div 
                  key={item.id ?? i} 
                  whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)" }}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-300 line-clamp-1">{item.text}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2.5 py-1 rounded-md border border-violet-200 dark:border-violet-800">
                        {item.service}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-900 px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-800">{item.theme}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <SentimentBadge sentiment={item.sentiment} />
                    {item.confidence > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-600 bg-gray-100 dark:bg-gray-900 px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-800">
                        {(item.confidence * 100).toFixed(0)}% conf.
                      </span>
                    )}
                    {item.created_at && (
                      <span className="text-xs text-gray-400 dark:text-gray-600 hidden lg:block">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

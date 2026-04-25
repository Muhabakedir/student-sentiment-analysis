import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare, ThumbsUp, Minus, ThumbsDown,
  AlertTriangle, TrendingDown, TrendingUp, Activity, Users, UserCheck,
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
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6 lg:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 space-y-6 max-w-7xl mx-auto">
        {/* Top bar */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-slate-800 dark:to-slate-900 rounded-2xl px-6 py-4 shadow-lg border border-blue-500/30 dark:border-slate-700 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full
              ${isLive
                ? "bg-green-500/30 dark:bg-green-900/30 text-green-400 dark:text-green-400 border border-green-500/50"
                : "bg-amber-500/30 dark:bg-amber-900/30 text-amber-400 dark:text-amber-400 border border-amber-500/50"
              }`}>
              <span className={`w-2 h-2 rounded-full ${isLive ? "bg-green-400 animate-pulse" : "bg-amber-400"}`} />
              {isLive ? "Live — BERT model active" : "Offline"}
            </div>
            {isLive && (
              <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-700/50 px-3 py-1.5 rounded-lg border border-slate-600/50">
                {stats.total} total submissions
              </span>
            )}
          </div>
          <DateRangePicker dateFrom={dates.dateFrom} dateTo={dates.dateTo} onChange={setDates} />
        </motion.div>

        {/* KPI Cards */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4"
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
          <StatCard
            label="Registered Students"
            value={(stats.total_students || 0).toLocaleString()}
            icon={Users}
            color="blue"
            sub="Anonymous — no names shown"
          />
          <StatCard
            label="Students Gave Feedback"
            value={(stats.students_with_feedback || 0).toLocaleString()}
            icon={UserCheck}
            color="purple"
            sub="Anonymous — no names shown"
          />
        </motion.div>

        {/* Highlight banners */}
        {(mostPositiveService || mostNegativeService || mostReportedTheme) && (
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {mostPositiveService && mostPositiveService.positive > 0 && (
              <motion.div 
                whileHover={{ y: -4 }}
                className="flex items-center gap-4 bg-gradient-to-br from-green-500/20 to-green-500/10 dark:from-green-900/20 dark:to-green-900/10 border border-green-500/50 dark:border-green-800/50 rounded-2xl px-6 py-4 shadow-lg backdrop-blur-xl"
              >
                <div className="p-3 bg-green-500/30 dark:bg-green-900/50 rounded-xl shrink-0 shadow-md">
                  <TrendingUp size={20} className="text-green-400 dark:text-green-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-green-400 dark:text-green-400 font-semibold uppercase tracking-wider mb-1">
                    Highest Satisfaction
                  </p>
                  <p className="text-sm font-semibold text-green-300 dark:text-green-200 truncate">
                    {mostPositiveService.service}
                  </p>
                  <p className="text-xs text-green-400 dark:text-green-400 mt-1">
                    {mostPositiveService.positive} positive responses
                  </p>
                </div>
              </motion.div>
            )}
            {mostNegativeService && mostNegativeService.negative > 0 && (
              <motion.div 
                whileHover={{ y: -4 }}
                className="flex items-center gap-4 bg-gradient-to-br from-red-500/20 to-red-500/10 dark:from-red-900/20 dark:to-red-900/10 border border-red-500/50 dark:border-red-800/50 rounded-2xl px-6 py-4 shadow-lg backdrop-blur-xl"
              >
                <div className="p-3 bg-red-500/30 dark:bg-red-900/50 rounded-xl shrink-0 shadow-md">
                  <TrendingDown size={20} className="text-red-400 dark:text-red-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-red-400 dark:text-red-400 font-semibold uppercase tracking-wider mb-1">
                    Most Negative Service
                  </p>
                  <p className="text-sm font-semibold text-red-300 dark:text-red-200 truncate">
                    {mostNegativeService.service}
                  </p>
                  <p className="text-xs text-red-400 dark:text-red-400 mt-1">
                    {mostNegativeService.negative} negative responses
                  </p>
                </div>
              </motion.div>
            )}
            {mostReportedTheme && (
              <motion.div 
                whileHover={{ y: -4 }}
                className="flex items-center gap-4 bg-gradient-to-br from-amber-500/20 to-amber-500/10 dark:from-amber-900/20 dark:to-amber-900/10 border border-amber-500/50 dark:border-amber-800/50 rounded-2xl px-6 py-4 shadow-lg backdrop-blur-xl"
              >
                <div className="p-3 bg-amber-500/30 dark:bg-amber-900/50 rounded-xl shrink-0 shadow-md">
                  <AlertTriangle size={20} className="text-amber-400 dark:text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-amber-400 dark:text-amber-400 font-semibold uppercase tracking-wider mb-1">
                    Most Reported Issue
                  </p>
                  <p className="text-sm font-semibold text-amber-300 dark:text-amber-200 truncate">
                    {mostReportedTheme[0]}
                  </p>
                  <p className="text-xs text-amber-400 dark:text-amber-400 mt-1">
                    {mostReportedTheme[1]} mentions
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Charts */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 dark:from-slate-800 dark:to-slate-900/50 rounded-2xl p-6 shadow-lg border border-slate-700/50 dark:border-slate-700 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Sentiment Distribution</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Overall breakdown across all services</p>
              </div>
            </div>
            <SentimentPieChart data={stats} />
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 dark:from-slate-800 dark:to-slate-900/50 rounded-2xl p-6 shadow-lg border border-slate-700/50 dark:border-slate-700 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Feedback per Service</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Sentiment breakdown by university service</p>
              </div>
            </div>
            <FeedbackBarChart data={serviceStats} />
          </motion.div>
        </motion.div>

        {/* Recent Feedback */}
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 dark:from-slate-800 dark:to-slate-900/50 rounded-2xl shadow-lg border border-slate-700/50 dark:border-slate-700 backdrop-blur-xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-700/50 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-slate-800/50 to-transparent dark:from-slate-800/50 dark:to-transparent">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity size={18} className="text-blue-400" />
                Recent Feedback
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Latest submissions with BERT sentiment</p>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-700/50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg border border-slate-600/50 dark:border-slate-600">
              Last {recentFeedback.length}
            </span>
          </div>
          <div className="divide-y divide-slate-700/50 dark:divide-slate-700">
            {recentFeedback.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-slate-400 dark:text-slate-500">
                No feedback submitted yet. Students can submit via the Student Portal.
              </p>
            ) : (
              recentFeedback.map((item, i) => (
                <motion.div 
                  key={item.id ?? i} 
                  whileHover={{ backgroundColor: "rgba(99, 102, 241, 0.05)" }}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 dark:text-slate-300 line-clamp-1">{item.text}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs text-blue-400 dark:text-blue-400 bg-blue-500/20 dark:bg-blue-900/30 px-2.5 py-1 rounded-md border border-blue-500/30 dark:border-blue-800/50">
                        {item.service}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-700/50 px-2.5 py-1 rounded-md border border-slate-600/50">{item.theme}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <SentimentBadge sentiment={item.sentiment} />
                    {item.confidence > 0 && (
                      <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-700/50 dark:bg-slate-700/50 px-2.5 py-1 rounded-md border border-slate-600/50 dark:border-slate-600">
                        {(item.confidence * 100).toFixed(0)}% conf.
                      </span>
                    )}
                    {item.created_at && (
                      <span className="text-xs text-slate-500 dark:text-slate-600 hidden lg:block">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

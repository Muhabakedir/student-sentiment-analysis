/**
 * Summary stat card with icon, value, label, and optional trend
 */
export default function StatCard({ label, value, icon: Icon, color, sub }) {
  const colorMap = {
    indigo: "bg-indigo-500/20 dark:bg-indigo-500/20 text-indigo-400 dark:text-indigo-400",
    green: "bg-emerald-500/20 dark:bg-emerald-500/20 text-emerald-400 dark:text-emerald-400",
    yellow: "bg-amber-500/20 dark:bg-amber-500/20 text-amber-400 dark:text-amber-400",
    red: "bg-rose-500/20 dark:bg-rose-500/20 text-rose-400 dark:text-rose-400",
    blue: "bg-sky-500/20 dark:bg-sky-500/20 text-sky-400 dark:text-sky-400",
    purple: "bg-violet-500/20 dark:bg-violet-500/20 text-violet-400 dark:text-violet-400",
  };

  return (
    <div className="bg-gradient-to-br from-violet-900/40 to-indigo-900/30 dark:from-violet-900/40 dark:to-indigo-900/30 rounded-2xl p-5 shadow-lg border border-violet-500/20 dark:border-violet-500/20 hover:shadow-xl backdrop-blur-xl transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 dark:text-slate-400 font-medium">
            {label}
          </p>
          <p className="text-2xl font-bold text-white dark:text-white mt-1">
            {value}
          </p>
          {sub && (
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              {sub}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.indigo}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

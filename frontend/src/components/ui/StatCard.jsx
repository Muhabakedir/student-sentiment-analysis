/**
 * Summary stat card with icon, value, label, and optional trend
 */
export default function StatCard({ label, value, icon: Icon, color, sub }) {
  const colorMap = {
    indigo: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400",
    green: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
    yellow: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
    red: "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400",
    blue: "bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400",
    purple: "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400",
  };

  return (
    <div className="bg-white dark:bg-black rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-600 font-medium">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-300 mt-1">
            {value}
          </p>
          {sub && (
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
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

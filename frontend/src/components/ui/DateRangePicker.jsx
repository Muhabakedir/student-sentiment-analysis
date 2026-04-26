/**
 * Simple date range picker — two native date inputs
 */
export default function DateRangePicker({ dateFrom, dateTo, onChange }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5">
        <label className="text-xs text-slate-400 dark:text-slate-400 whitespace-nowrap">From</label>
        <input
          type="date"
          value={dateFrom}
          onChange={e => onChange({ dateFrom: e.target.value, dateTo })}
          className="px-3 py-2 rounded-xl text-sm border border-violet-500/30 dark:border-violet-500/30 bg-violet-900/30 dark:bg-violet-900/30 text-slate-200 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
        />
      </div>
      <div className="flex items-center gap-1.5">
        <label className="text-xs text-slate-400 dark:text-slate-400 whitespace-nowrap">To</label>
        <input
          type="date"
          value={dateTo}
          onChange={e => onChange({ dateFrom, dateTo: e.target.value })}
          className="px-3 py-2 rounded-xl text-sm border border-violet-500/30 dark:border-violet-500/30 bg-violet-900/30 dark:bg-violet-900/30 text-slate-200 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
        />
      </div>
      {(dateFrom || dateTo) && (
        <button
          onClick={() => onChange({ dateFrom: "", dateTo: "" })}
          className="text-xs text-slate-400 hover:text-slate-200 dark:hover:text-slate-200 px-2 py-1 rounded-lg hover:bg-violet-500/20 dark:hover:bg-violet-500/20 transition-colors"
        >
          Clear dates
        </button>
      )}
    </div>
  );
}

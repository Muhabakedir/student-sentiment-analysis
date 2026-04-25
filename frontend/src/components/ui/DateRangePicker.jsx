/**
 * Simple date range picker — two native date inputs
 */
export default function DateRangePicker({ dateFrom, dateTo, onChange }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5">
        <label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">From</label>
        <input
          type="date"
          value={dateFrom}
          onChange={e => onChange({ dateFrom: e.target.value, dateTo })}
          className="px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
        />
      </div>
      <div className="flex items-center gap-1.5">
        <label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">To</label>
        <input
          type="date"
          value={dateTo}
          onChange={e => onChange({ dateFrom, dateTo: e.target.value })}
          className="px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
        />
      </div>
      {(dateFrom || dateTo) && (
        <button
          onClick={() => onChange({ dateFrom: "", dateTo: "" })}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Clear dates
        </button>
      )}
    </div>
  );
}

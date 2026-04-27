/**
 * Loading skeleton components
 */
export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-7 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-2 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-800 animate-pulse">
      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
      <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse">
      <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-3 flex-1 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
    </div>
  );
}

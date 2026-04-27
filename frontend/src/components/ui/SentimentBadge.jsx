/**
 * Color-coded sentiment badge
 */
export default function SentimentBadge({ sentiment }) {
  const styles = {
    positive: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400",
    neutral: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
    negative: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
        styles[sentiment] || styles.neutral
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          sentiment === "positive"
            ? "bg-violet-500"
            : sentiment === "negative"
            ? "bg-rose-500"
            : "bg-amber-500"
        }`}
      />
      {sentiment}
    </span>
  );
}

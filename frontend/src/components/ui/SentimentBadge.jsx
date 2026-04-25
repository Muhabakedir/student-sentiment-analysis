/**
 * Color-coded sentiment badge
 */
export default function SentimentBadge({ sentiment }) {
  const styles = {
    positive: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400",
    neutral: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400",
    negative: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        styles[sentiment] || styles.neutral
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          sentiment === "positive"
            ? "bg-green-500"
            : sentiment === "negative"
            ? "bg-red-500"
            : "bg-yellow-500"
        }`}
      />
      {sentiment}
    </span>
  );
}

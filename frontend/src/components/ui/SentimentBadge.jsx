/**
 * Color-coded sentiment badge
 */
export default function SentimentBadge({ sentiment }) {
  const styles = {
    positive: "bg-violet-500/20 dark:bg-violet-500/20 text-violet-300 dark:text-violet-400",
    neutral: "bg-cyan-500/20 dark:bg-cyan-500/20 text-cyan-300 dark:text-cyan-400",
    negative: "bg-rose-500/20 dark:bg-rose-500/20 text-rose-300 dark:text-rose-400",
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
            ? "bg-violet-500"
            : sentiment === "negative"
            ? "bg-rose-500"
            : "bg-cyan-500"
        }`}
      />
      {sentiment}
    </span>
  );
}

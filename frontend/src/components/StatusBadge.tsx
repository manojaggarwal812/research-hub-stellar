import { clsx } from "clsx";

const tones: Record<string, string> = {
  Active: "bg-tide-500/15 text-tide-600 dark:text-tide-400",
  UnderReview: "bg-ember-500/15 text-ember-600",
  Completed: "bg-ink-900/10 text-ink-800 dark:bg-ink-100/10 dark:text-ink-100",
  Draft: "bg-ink-200/60 text-ink-700 dark:bg-ink-800 dark:text-ink-200",
  Cancelled: "bg-red-500/15 text-red-600",
  Pending: "bg-ink-200/60 text-ink-700 dark:bg-ink-800 dark:text-ink-200",
  Submitted: "bg-ember-500/15 text-ember-600",
  Approved: "bg-tide-500/15 text-tide-600",
  Funded: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  Rejected: "bg-red-500/15 text-red-600",
  Approve: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  Revise: "bg-ember-500/15 text-ember-600",
  Reject: "bg-red-500/15 text-red-600",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        tones[value] ?? "bg-ink-200 text-ink-700",
      )}
    >
      {value}
    </span>
  );
}

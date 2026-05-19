export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatRelativeTime(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const diffMs = date.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / 60_000);

  if (Math.abs(diffMinutes) < 60) {
    const label = Math.abs(diffMinutes) === 1 ? "minute" : "minutes";
    if (diffMinutes === 0) return "just now";
    if (diffMinutes > 0) return `in ${diffMinutes} ${label}`;
    return `${Math.abs(diffMinutes)} ${label} ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  const hourLabel = Math.abs(diffHours) === 1 ? "hour" : "hours";
  if (Math.abs(diffHours) < 48) {
    if (diffHours > 0) return `in ${diffHours} ${hourLabel}`;
    return `${Math.abs(diffHours)} ${hourLabel} ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  const dayLabel = Math.abs(diffDays) === 1 ? "day" : "days";
  if (diffDays > 0) return `in ${diffDays} ${dayLabel}`;
  return `${Math.abs(diffDays)} ${dayLabel} ago`;
}

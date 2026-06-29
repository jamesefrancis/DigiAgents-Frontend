// filepath: frontend/src/utils/date-time.js
export function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDurationSeconds(seconds = 0) {
  const safe = Number(seconds) || 0;
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;

  if (mins <= 0) {
    return `${secs}s`;
  }

  return `${mins}m ${secs}s`;
}

export function timeAgo(value) {
  if (!value) return '-';
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return '-';

  const diff = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

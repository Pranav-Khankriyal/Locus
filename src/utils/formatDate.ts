export function formatDate(value: string | null | undefined, time = false) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        ...(time ? ({ hour: '2-digit', minute: '2-digit' } as const) : {}),
      }).format(date);
}

export const initials = (name?: string | null): string => {
  if (!name || typeof name !== 'string') return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'U';
  return parts.map((n) => n[0] || '').slice(0, 2).join('').toUpperCase() || 'U';
};

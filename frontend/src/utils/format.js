export const formatDate = (value, options = {}) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
};

export const formatDateTime = (value) =>
  formatDate(value, { hour: '2-digit', minute: '2-digit' });

export const isOverdue = (value) => value && new Date(value) < new Date();

export const daysUntil = (value) => {
  if (!value) return null;
  const diff = new Date(value).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

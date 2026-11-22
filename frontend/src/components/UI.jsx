import { useEffect } from 'react';
import { X, AlertCircle, CheckCircle2, Inbox, Loader2 } from 'lucide-react';
import { initials } from '../utils/format';

export const Spinner = ({ className = 'h-5 w-5' }) => (
  <Loader2 className={`animate-spin ${className}`} aria-hidden="true" />
);

export const LoadingScreen = ({ label = 'Loading...' }) => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-500">
    <Spinner className="h-8 w-8 text-brand-600" />
    <p className="text-sm font-medium">{label}</p>
  </div>
);

export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const StatCard = ({ icon: Icon, label, value, hint, tone = 'brand' }) => {
  const tones = {
    brand: 'bg-brand-50 text-brand-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        {Icon && (
          <div className={`rounded-lg p-2.5 ${tones[tone] || tones.brand}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export const Badge = ({ tone = 'slate', children, icon: Icon }) => {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    brand: 'bg-brand-50 text-brand-700',
  };
  return (
    <span className={`badge ${tones[tone] || tones.slate}`}>
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </span>
  );
};

export const ProgressBar = ({ value = 0, tone = 'brand', showLabel = false, size = 'md' }) => {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const colors = {
    brand: 'bg-brand-600',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
  };
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3' };
  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1.5 flex justify-between text-xs font-semibold">
          <span className="text-slate-600">Progress</span>
          <span className="text-slate-900">{pct}%</span>
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-slate-200 ${heights[size] || heights.md}`}>
        <div
          className={`${colors[tone] || colors.brand} h-full rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
    </div>
  );
};

export const Modal = ({ open, onClose, title, children, footer, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`relative w-full ${maxWidth} animate-fade-in overflow-hidden rounded-xl bg-white shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
};

export const Alert = ({ type = 'error', message, onClose }) => {
  if (!message) return null;
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
  };
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle;
  return (
    <div className={`mb-4 flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm ${styles[type] || styles.error}`}>
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} aria-label="Dismiss">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export const EmptyState = ({ icon: Icon = Inbox, title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
    <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-400">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="font-semibold text-slate-800">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const Avatar = ({ name, size = 'md' }) => {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' };
  return (
    <div className={`flex flex-shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700 ${sizes[size] || sizes.md}`}>
      {initials(name)}
    </div>
  );
};

export const Field = ({ label, hint, error, children }) => (
  <div>
    <label className="label">{label}</label>
    {children}
    {error ? (
      <p className="mt-1 text-xs text-red-600">{error}</p>
    ) : hint ? (
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    ) : null}
  </div>
);

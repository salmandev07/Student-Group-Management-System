import { useEffect } from 'react';
import { X, AlertCircle, CheckCircle2, Inbox, Loader2, Info } from 'lucide-react';
import { initials } from '../utils/format';

export const Spinner = ({ className = 'h-5 w-5' }) => (
  <Loader2 className={`animate-spin ${className}`} aria-hidden="true" />
);

export const LoadingScreen = ({ label = 'Loading...' }) => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-white/50">
    <Spinner className="h-8 w-8 text-indigo-400" />
    <p className="text-sm font-medium">{label}</p>
  </div>
);

export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1.5 text-sm text-white/50">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

const TONES = {
  brand: 'from-indigo-500/25 to-violet-500/10 text-indigo-200 ring-indigo-400/20',
  green: 'from-emerald-500/25 to-teal-500/10 text-emerald-200 ring-emerald-400/20',
  amber: 'from-amber-500/25 to-orange-500/10 text-amber-200 ring-amber-400/20',
  violet: 'from-fuchsia-500/25 to-purple-500/10 text-fuchsia-200 ring-fuchsia-400/20',
};

export const StatCard = ({ icon: Icon, label, value, hint, tone = 'brand' }) => (
  <div className="card group relative overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20">
    <div className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br opacity-40 blur-2xl transition group-hover:opacity-70 ${TONES[tone] || TONES.brand}`} />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-white/45">{label}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-white">{value}</p>
        {hint && <p className="mt-1 text-xs text-white/35">{hint}</p>}
      </div>
      {Icon && (
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ${TONES[tone] || TONES.brand}`}>
          <Icon className="h-5 w-5" />
        </div>
      )}
    </div>
  </div>
);

export const Badge = ({ tone = 'slate', children, icon: Icon }) => {
  const tones = {
    slate: 'badge-slate',
    green: 'badge-green',
    amber: 'badge-amber',
    red: 'badge-red',
    brand: 'badge-brand',
    violet: 'badge-brand',
  };
  return (
    <span className={tones[tone] || tones.slate}>
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </span>
  );
};

export const ProgressBar = ({ value = 0, tone = 'brand', showLabel = false, size = 'md' }) => {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const fills = {
    brand: 'bg-gradient-to-r from-indigo-500 to-violet-400',
    green: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    amber: 'bg-gradient-to-r from-amber-500 to-orange-400',
  };
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3' };
  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1.5 flex justify-between text-xs">
          <span className="font-medium text-white/50">Progress</span>
          <span className="font-semibold text-white">{pct}%</span>
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-white/10 ${heights[size] || heights.md}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${fills[tone] || fills.brand}`}
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
        className="absolute inset-0 bg-[#050814]/75 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`relative w-full ${maxWidth} animate-fade-up overflow-hidden rounded-2xl border border-white/15 bg-[#101735]/95 shadow-2xl shadow-indigo-950/60`}>
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/45 transition hover:bg-white/10 hover:text-white" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-white/10 bg-white/[0.03] px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
};

export const Alert = ({ type = 'error', message, onClose }) => {
  if (!message) return null;
  const styles = {
    error: 'border-red-400/25 bg-red-500/10 text-red-100',
    success: 'border-emerald-400/25 bg-emerald-500/10 text-emerald-100',
    info: 'border-indigo-400/25 bg-indigo-500/10 text-indigo-100',
  };
  const Icon = type === 'success' ? CheckCircle2 : type === 'info' ? Info : AlertCircle;
  return (
    <div className={`mb-4 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${styles[type] || styles.error}`}>
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export const EmptyState = ({ icon: Icon = Inbox, title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/12 bg-white/[0.03] px-6 py-12 text-center">
    <div className="mb-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-indigo-200">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="font-semibold text-white">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-sm text-white/50">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const Avatar = ({ name, size = 'md' }) => {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' };
  return (
    <div className={`flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/80 to-violet-600/80 font-bold text-white ring-1 ring-white/20 ${sizes[size] || sizes.md}`}>
      {initials(name)}
    </div>
  );
};

export const Field = ({ label, hint, error, children }) => (
  <div>
    <label className="label">{label}</label>
    {children}
    {error ? (
      <p className="mt-1 text-xs text-red-300">{error}</p>
    ) : hint ? (
      <p className="hint">{hint}</p>
    ) : null}
  </div>
);

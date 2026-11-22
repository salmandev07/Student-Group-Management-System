import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  GraduationCap, ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight,
  Sparkles, Users, ClipboardCheck, BarChart3, CheckCircle2, Zap,
} from 'lucide-react';
import { AnimatedBackground } from '../components/Animated';
import { useAuth } from '../context/AuthContext';
import { Alert, Spinner } from '../components/UI';

const DEMO = {
  student: { email: 'alice@student.com', password: 'password123' },
  professor: { email: 'professor@joineazy.com', password: 'admin123' },
};

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialRole = params.get('role') === 'professor' ? 'professor' : 'student';

  const [role, setRole] = useState(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState(() => ({ ...DEMO[initialRole] }));
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const switchRole = (next) => {
    setRole(next);
    setForm({ ...DEMO[next] });
    setError('');
    setInfo('');
    setShowPassword(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);
    try {
      await login(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AnimatedBackground />
      <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Brand / hero */}
          <div className="hidden animate-fade-up lg:block">
            <Link to="/" className="mb-10 inline-flex items-center gap-3">
              <span className="animate-pulse-ring flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-xl">
                <GraduationCap className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-xl font-bold tracking-tight text-white">SGAMS</span>
                <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">by Joineazy</span>
              </span>
            </Link>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5 text-violet-300" />
              The new way student teams work
            </div>

            <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight xl:text-6xl">
              <span className="text-gradient">Group projects,</span>
              <br />
              <span className="shimmer-text">finally under control.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/65">
              Form your own groups, confirm submissions in two clicks, and give professors a live view of every team's progress — all in one beautiful workspace.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              {[
                { icon: Users, label: 'Self-formed groups' },
                { icon: ClipboardCheck, label: 'Two-step submit' },
                { icon: BarChart3, label: 'Live analytics' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="glass-soft inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/80">
                  <Icon className="h-4 w-4 text-indigo-300" /> {label}
                </span>
              ))}
            </div>

            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3">
                {['AJ', 'BS', 'CB', 'DP'].map((a, i) => (
                  <span
                    key={a}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/20 text-xs font-bold text-white"
                    style={{ background: ['#6366f1', '#a855f7', '#0ea5e9', '#10b981'][i] }}
                  >
                    {a}
                  </span>
                ))}
              </div>
              <p className="text-sm text-white/60">
                <strong className="text-white">500+ teams</strong> already collaborating
              </p>
            </div>
          </div>

          {/* Glass login card */}
          <div className="glass relative animate-fade-up overflow-hidden rounded-3xl p-7 sm:p-10" style={{ animationDelay: '120ms' }}>
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />

            <div className="relative">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back</h2>
                  <p className="mt-1.5 text-sm text-white/60">Sign in to your workspace to continue.</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur">
                  {role === 'student' ? <GraduationCap className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                </div>
              </div>

              {/* Role switcher */}
              <div className="relative mb-7 flex rounded-2xl border border-white/15 bg-white/5 p-1.5">
                <span
                  className="absolute bottom-1.5 left-1.5 top-1.5 w-[calc(50%-6px)] rounded-xl bg-white shadow-lg transition-transform duration-300 ease-out"
                  style={{ transform: role === 'professor' ? 'translateX(100%)' : 'translateX(0)' }}
                />
                {[
                  { key: 'student', label: 'Student', icon: GraduationCap },
                  { key: 'professor', label: 'Professor', icon: ShieldCheck },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => switchRole(key)}
                    className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors duration-200 ${
                      role === key ? 'text-slate-900' : 'text-white/65 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
              </div>

              <Alert type="error" message={error} onClose={() => setError('')} className="[&_div]:border-white/20" />
              <Alert type="info" message={info} onClose={() => setInfo('')} />

              <form onSubmit={submit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">Email address</label>
                  <div className="relative">
                    <Mail className="glass-input-icon" />
                    <input
                      type="email"
                      className="glass-input pl-11"
                      placeholder="you@student.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/60">Password</label>
                    <button
                      type="button"
                      onClick={() => setInfo('Please contact your professor or administrator to reset your password.')}
                      className="text-xs font-medium text-indigo-300 transition hover:text-indigo-200"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="glass-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="glass-input pl-11 pr-11"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 transition hover:text-white"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-gradient w-full" disabled={submitting}>
                  {submitting ? <Spinner /> : <>Sign in as {role === 'student' ? 'Student' : 'Professor'} <ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>

              <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50">
                  <Zap className="h-3.5 w-3.5 text-amber-300" /> Demo account pre-filled
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-white/80">{DEMO[role].email}</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...DEMO[role] })}
                    className="flex-shrink-0 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    Use demo
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-white/40">Password: {DEMO[role].password}</p>
              </div>

              <p className="mt-7 text-center text-sm text-white/60">
                New to SGAMS?{' '}
                <Link to="/register" className="font-semibold text-indigo-300 transition hover:text-indigo-200">
                  Create a student account
                </Link>
              </p>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/40">
                <CheckCircle2 className="h-3.5 w-3.5" /> Secure JWT authentication · Role-based access
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

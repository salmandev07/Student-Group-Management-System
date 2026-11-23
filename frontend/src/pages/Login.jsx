import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  GraduationCap, ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, Users,
  ClipboardCheck, BarChart3,
} from 'lucide-react';
import { AnimatedBackground } from '../components/Animated';
import { useAuth } from '../context/AuthContext';
import { Alert, Spinner } from '../components/UI';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get('role') === 'professor' ? 'professor' : 'student');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const signedInUser = await login(form);
      navigate(signedInUser.role === 'admin' ? '/admin/dashboard' : '/student/dashboard', { replace: true });
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
          <div className="hidden animate-fade-up lg:block">
            <Link to="/" className="mb-10 inline-flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-xl">
                <GraduationCap className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-xl font-bold tracking-tight text-white">SGAMS</span>
                <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">by Joineazy</span>
              </span>
            </Link>

            <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight xl:text-6xl">
              <span className="text-gradient">Group projects,</span>
              <br />
              <span className="shimmer-text">finally under control.</span>
            </h1>

            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { icon: Users, label: 'Groups' },
                { icon: ClipboardCheck, label: 'Submissions' },
                { icon: BarChart3, label: 'Progress' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="glass-soft inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/80">
                  <Icon className="h-4 w-4 text-indigo-300" /> {label}
                </span>
              ))}
            </div>
          </div>

          <div className="glass relative animate-fade-up overflow-hidden rounded-3xl p-7 sm:p-10" style={{ animationDelay: '120ms' }}>
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />

            <div className="relative">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back</h2>
                  <p className="mt-1.5 text-sm text-white/60">Sign in to continue.</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur">
                  {role === 'student' ? <GraduationCap className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                </div>
              </div>

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
                    onClick={() => setRole(key)}
                    className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors duration-200 ${
                      role === key ? 'text-slate-900' : 'text-white/65 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
              </div>

              <Alert type="error" message={error} onClose={() => setError('')} />

              <form onSubmit={submit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">Email address</label>
                  <div className="relative">
                    <Mail className="glass-input-icon" />
                    <input
                      type="email"
                      className="glass-input pl-11"
                      placeholder="Email address"
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
                    <Link to="/forgot-password" className="text-xs font-medium text-indigo-300 transition hover:text-indigo-200">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="glass-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="glass-input pl-11 pr-11"
                      placeholder="Password"
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
                  {submitting ? <Spinner /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>

              <p className="mt-7 text-center text-sm text-white/60">
                New here?{' '}
                <Link to="/register" className="font-semibold text-indigo-300 transition hover:text-indigo-200">
                  Create a student account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

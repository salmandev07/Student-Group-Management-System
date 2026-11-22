import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, Users, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert, Field, Spinner } from '../components/UI';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
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
      await login(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (email, password) => setForm({ email, password });

  return (
    <div className="flex min-h-screen bg-white">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-brand-700 p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-600/50 blur-2xl" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-brand-800/60 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight">SGAMS</p>
            <p className="text-xs uppercase tracking-widest text-brand-200">Joineazy</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-bold leading-tight">
            Team up. Submit together. Stay on track.
          </h1>
          <p className="mt-4 text-brand-100">
            A simple workspace for students to form groups and confirm assignments — and for
            professors to see every team's progress at a glance.
          </p>
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3 backdrop-blur">
              <Users className="h-5 w-5 text-brand-200" />
              <span className="text-sm">Form groups and add members by email or student ID</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3 backdrop-blur">
              <ClipboardCheck className="h-5 w-5 text-brand-200" />
              <span className="text-sm">Two-step submission confirmation with live progress</span>
            </div>
          </div>
        </div>
        <p className="relative text-xs text-brand-200">© 2026 Joineazy. Intern task demonstration.</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center px-5 py-10 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2 text-brand-700">
              <GraduationCap className="h-7 w-7" />
              <span className="text-xl font-bold">SGAMS</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500">Sign in to continue to your workspace.</p>

          <div className="mt-8">
            <Alert message={error} onClose={() => setError('')} />

            <form onSubmit={submit} className="space-y-5">
              <Field label="Email address">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    className="input pl-10"
                    placeholder="you@student.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    autoComplete="email"
                  />
                </div>
              </Field>

              <Field label="Password">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input pl-10 pr-10"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              <button type="submit" className="btn-primary w-full" disabled={submitting}>
                {submitting ? <Spinner /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              New here?{' '}
              <a href="/register" className="font-semibold text-brand-600 hover:text-brand-700">
                Create an account
              </a>
            </p>

            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Demo credentials (click to fill)
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fillDemo('alice@student.com', 'password123')}
                  className="flex w-full items-center justify-between rounded-lg bg-white px-3 py-2 text-left text-sm shadow-sm hover:bg-brand-50"
                >
                  <span><strong className="text-slate-700">Student</strong> · alice@student.com</span>
                  <span className="text-xs text-slate-400">password123</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('professor@joineazy.com', 'admin123')}
                  className="flex w-full items-center justify-between rounded-lg bg-white px-3 py-2 text-left text-sm shadow-sm hover:bg-brand-50"
                >
                  <span><strong className="text-slate-700">Professor</strong> · professor@joineazy.com</span>
                  <span className="text-xs text-slate-400">admin123</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

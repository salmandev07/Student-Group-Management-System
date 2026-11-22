import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  GraduationCap, User, Mail, Contact, Lock, ArrowLeft, Sparkles,
  ShieldCheck, ArrowRight, CheckCircle2,
} from 'lucide-react';
import { AnimatedBackground } from '../components/Animated';
import { useAuth } from '../context/AuthContext';
import { Alert, Spinner } from '../components/UI';

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', studentId: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        studentId: form.studentId || undefined,
        password: form.password,
      });
      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const field = (Icon, props) => (
    <div className="relative">
      <Icon className="glass-input-icon" />
      <input className="glass-input pl-11" {...props} />
    </div>
  );

  return (
    <>
      <AnimatedBackground />
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl animate-fade-up">
          <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/60 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>

          <div className="glass relative overflow-hidden rounded-3xl p-7 sm:p-10">
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-500/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />

            <div className="relative">
              <div className="mb-7 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/75">
                    <Sparkles className="h-3.5 w-3.5 text-violet-300" /> Join your classmates
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">Create your account</h1>
                  <p className="mt-2 text-sm text-white/60">It only takes a minute to start collaborating.</p>
                </div>
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur">
                  <GraduationCap className="h-6 w-6" />
                </div>
              </div>

              <div className="mb-6 flex items-center gap-2 rounded-xl border border-indigo-400/25 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-100">
                <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                Student accounts are self-service. Professor accounts are issued by your institution.
              </div>

              <Alert type="error" message={error} onClose={() => setError('')} />

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">Full name</label>
                  {field(User, {
                    type: 'text', placeholder: 'Jane Doe', value: form.name,
                    onChange: (e) => setForm({ ...form, name: e.target.value }), required: true,
                  })}
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">Email address</label>
                  {field(Mail, {
                    type: 'email', placeholder: 'jane@student.com', value: form.email,
                    onChange: (e) => setForm({ ...form, email: e.target.value }), required: true,
                  })}
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">
                    Student ID <span className="font-normal normal-case tracking-normal text-white/35">(optional)</span>
                  </label>
                  {field(Contact, {
                    type: 'text', placeholder: 'STU007', value: form.studentId,
                    onChange: (e) => setForm({ ...form, studentId: e.target.value }),
                  })}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">Password</label>
                    {field(Lock, {
                      type: 'password', placeholder: 'Min. 6 characters', value: form.password,
                      onChange: (e) => setForm({ ...form, password: e.target.value }), minLength: 6, required: true,
                    })}
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">Confirm</label>
                    {field(Lock, {
                      type: 'password', placeholder: 'Repeat password', value: form.confirm,
                      onChange: (e) => setForm({ ...form, confirm: e.target.value }), required: true,
                    })}
                  </div>
                </div>

                <button type="submit" className="btn-gradient mt-2 w-full" disabled={submitting}>
                  {submitting ? <Spinner /> : <>Create account <ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>

              <p className="mt-7 text-center text-sm text-white/60">
                Already registered?{' '}
                <Link to="/login" className="font-semibold text-indigo-300 transition hover:text-indigo-200">Sign in</Link>
              </p>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/40">
                <CheckCircle2 className="h-3.5 w-3.5" /> Your data stays private and secure
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

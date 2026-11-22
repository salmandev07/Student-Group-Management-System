import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { GraduationCap, User, Mail, Contact, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert, Field, Spinner } from '../components/UI';

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
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputWithIcon = (Icon, props) => (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input className="input pl-10" {...props} />
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <div className="w-full max-w-lg">
        <Link to="/login" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>

        <div className="card p-7 sm:p-9">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
              <p className="text-sm text-slate-500">Join your classmates and start collaborating.</p>
            </div>
          </div>

          <Alert message={error} onClose={() => setError('')} />

          <form onSubmit={submit} className="space-y-4">
            <Field label="Full name">
              {inputWithIcon(User, {
                type: 'text',
                placeholder: 'Jane Doe',
                value: form.name,
                onChange: (e) => setForm({ ...form, name: e.target.value }),
                required: true,
              })}
            </Field>
            <Field label="Email address">
              {inputWithIcon(Mail, {
                type: 'email',
                placeholder: 'jane@student.com',
                value: form.email,
                onChange: (e) => setForm({ ...form, email: e.target.value }),
                required: true,
              })}
            </Field>
            <Field label="Student ID" hint="Optional — teammates can also add you by email.">
              {inputWithIcon(Contact, {
                type: 'text',
                placeholder: 'STU007',
                value: form.studentId,
                onChange: (e) => setForm({ ...form, studentId: e.target.value }),
              })}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Password" hint="Minimum 6 characters.">
                {inputWithIcon(Lock, {
                  type: 'password',
                  placeholder: '••••••••',
                  value: form.password,
                  onChange: (e) => setForm({ ...form, password: e.target.value }),
                  minLength: 6,
                  required: true,
                })}
              </Field>
              <Field label="Confirm password">
                {inputWithIcon(Lock, {
                  type: 'password',
                  placeholder: '••••••••',
                  value: form.confirm,
                  onChange: (e) => setForm({ ...form, confirm: e.target.value }),
                  required: true,
                })}
              </Field>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? <Spinner /> : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

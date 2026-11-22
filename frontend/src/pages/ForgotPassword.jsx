import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Mail, KeyRound, Lock, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AnimatedBackground } from '../components/Animated';
import { authApi } from '../api';
import { Alert, Spinner } from '../components/UI';

export default function ForgotPassword() {
  const [params] = useSearchParams();
  const [step, setStep] = useState(params.get('token') ? 2 : 1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(params.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const requestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await authApi.forgotPassword({ email });
      if (data.resetToken) {
        setToken(data.resetToken);
        setStep(2);
      } else {
        setSuccess(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      const data = await authApi.resetPassword({ token, password });
      setSuccess(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AnimatedBackground />
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg animate-fade-up">
          <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/60 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>

          <div className="glass relative overflow-hidden rounded-3xl p-7 sm:p-10">
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />

            <div className="relative">
              <div className="mb-7 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/75">
                    <KeyRound className="h-3.5 w-3.5 text-indigo-300" /> Account recovery
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">
                    {success ? 'Password updated' : step === 1 ? 'Forgot your password?' : 'Set a new password'}
                  </h1>
                  <p className="mt-2 text-sm text-white/55">
                    {success
                      ? 'You can now sign in with your new password.'
                      : step === 1
                        ? 'Enter your account email and we will generate a reset token.'
                        : 'Enter the reset token and choose a new password.'}
                  </p>
                </div>
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>

              <Alert type="error" message={error} onClose={() => setError('')} />
              <Alert type="success" message={success} />

              {success ? (
                <Link to="/login" className="btn-gradient mt-4 w-full">
                  Go to sign in <ArrowRight className="h-4 w-4" />
                </Link>
              ) : step === 1 ? (
                <form onSubmit={requestReset} className="space-y-5">
                  <div>
                    <label className="label">Account email</label>
                    <div className="relative">
                      <Mail className="glass-input-icon" />
                      <input
                        type="email"
                        className="glass-input pl-11"
                        placeholder="you@student.com or professor@joineazy.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-gradient w-full" disabled={submitting}>
                    {submitting ? <Spinner /> : <>Generate reset token <ArrowRight className="h-4 w-4" /></>}
                  </button>
                  <p className="text-center text-xs text-white/40">
                    For this demo the token is shown on screen instead of being emailed.
                  </p>
                </form>
              ) : (
                <form onSubmit={resetPassword} className="space-y-5">
                  <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/10 p-3.5">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-200">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Reset token
                    </div>
                    <p className="break-all font-mono text-xs text-white/75">{token}</p>
                  </div>
                  <div>
                    <label className="label">Reset token</label>
                    <div className="relative">
                      <KeyRound className="glass-input-icon" />
                      <input
                        className="glass-input pl-11 font-mono text-xs"
                        placeholder="Paste your token"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label">New password</label>
                      <div className="relative">
                        <Lock className="glass-input-icon" />
                        <input
                          type="password"
                          className="glass-input pl-11"
                          placeholder="Min. 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          minLength={6}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label">Confirm password</label>
                      <div className="relative">
                        <Lock className="glass-input-icon" />
                        <input
                          type="password"
                          className="glass-input pl-11"
                          placeholder="Repeat password"
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          minLength={6}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="btn-gradient w-full" disabled={submitting}>
                    {submitting ? <Spinner /> : 'Update password'}
                  </button>
                  <button type="button" onClick={() => { setStep(1); setError(''); }} className="w-full text-center text-xs text-white/45 hover:text-white">
                    Use a different email
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

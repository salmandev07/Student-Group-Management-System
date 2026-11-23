import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Mail, KeyRound, Lock, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AnimatedBackground } from '../components/Animated';
import { authApi } from '../api';
import { Alert, Spinner } from '../components/UI';

export default function ForgotPassword() {
  const [params] = useSearchParams();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(params.get('email') || '');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const requestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await authApi.forgotPassword({ email });
      if (data.otp) {
        setGeneratedOtp(data.otp);
        setOtp('');
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
      const data = await authApi.resetPassword({ email, otp, password });
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
                        ? 'Enter your account email to receive a one-time code.'
                        : 'Enter the code and your new password.'}
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
                <form onSubmit={requestOtp} className="space-y-5">
                  <div>
                    <label className="label">Account email</label>
                    <div className="relative">
                      <Mail className="glass-input-icon" />
                      <input
                        type="email"
                        className="glass-input pl-11"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-gradient w-full" disabled={submitting}>
                    {submitting ? <Spinner /> : <>Send OTP <ArrowRight className="h-4 w-4" /></>}
                  </button>
                </form>
              ) : (
                <form onSubmit={resetPassword} className="space-y-5">
                  <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/10 p-4 text-center">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-indigo-200">One-time code</p>
                    <p className="text-2xl font-bold tracking-[0.35em] text-white">{generatedOtp}</p>
                  </div>
                  <div>
                    <label className="label">Enter the 6-digit code</label>
                    <div className="relative">
                      <KeyRound className="glass-input-icon" />
                      <input
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        className="glass-input pl-11 tracking-[0.3em]"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
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
                          placeholder="New password"
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
                          placeholder="Confirm password"
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

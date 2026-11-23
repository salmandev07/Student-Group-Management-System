import { Link } from 'react-router-dom';
import {
  GraduationCap, ShieldCheck, ArrowRight, Users, ClipboardCheck,
  BarChart3, CheckCircle2, Clock, PlayCircle, TrendingUp, ArrowUpRight,
} from 'lucide-react';
import { AnimatedBackground, TiltCard, useRotatingWord } from '../components/Animated';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: Users,
    title: 'Form your own groups',
    text: 'Create a team and invite classmates by email or student ID. Everyone works from the same list of assignments.',
    tone: 'from-indigo-500/25 to-violet-500/10',
  },
  {
    icon: ClipboardCheck,
    title: 'Two-step submission',
    text: 'Students acknowledge the upload, then confirm it. Professors see exactly which groups have submitted.',
    tone: 'from-emerald-500/25 to-teal-500/10',
  },
  {
    icon: BarChart3,
    title: 'Progress at a glance',
    text: 'Completion rates, group progress and recent confirmations are collected on one dashboard.',
    tone: 'from-fuchsia-500/25 to-pink-500/10',
  },
];

const STEPS = [
  { n: '01', title: 'Choose your role', text: 'Students and professors get different workspaces from the moment they sign in.' },
  { n: '02', title: 'Build your team', text: 'Create a group, add members, and see the assignments assigned to you.' },
  { n: '03', title: 'Confirm and track', text: 'Upload to OneDrive, confirm in two steps, and watch progress update.' },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const word = useRotatingWord(['groups', 'submissions', 'progress']);

  return (
    <>
      <AnimatedBackground />
      <div className="relative min-h-screen text-white">
        <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-xl">
              <GraduationCap className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-lg font-bold leading-tight tracking-tight">SGAMS</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Joineazy</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#how" className="transition hover:text-white">How it works</a>
            <a href="#start" className="transition hover:text-white">Get started</a>
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <Link to="/dashboard" className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:text-white sm:block">
                Dashboard
              </Link>
            )}
            <Link to="/login" className="glass-soft hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 sm:block">
              Sign in
            </Link>
            <Link to="/register" className="btn-gradient !px-4 !py-2.5 text-sm">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <main>
          <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-2 lg:pt-20">
            <div className="animate-fade-up">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white/75 backdrop-blur-xl">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-300" />
                Student group assignment management
              </div>

              <h1 className="text-5xl font-extrabold leading-[1.06] tracking-tight sm:text-6xl xl:text-7xl">
                <span className="text-gradient">Group projects,</span>
                <br />
                <span className="shimmer-text">finally under control.</span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/60">
                SGAMS keeps student teams, assignment links and submission confirmations in one place — and gives professors a clear view of every group's <span className="font-semibold text-white/90">{word}</span>.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/login?role=student" className="btn-gradient group">
                  <GraduationCap className="h-5 w-5" /> Continue as Student
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to="/login?role=professor" className="glass group inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
                  <ShieldCheck className="h-5 w-5 text-indigo-200" /> Continue as Professor
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            <div className="animate-fade-up [animation-delay:160ms]">
              <div className="animate-float">
                <div className="glass overflow-hidden rounded-3xl p-2 shadow-2xl shadow-indigo-950/50">
                  <div className="rounded-[18px] border border-white/10 bg-[#0d1330]/80 p-5">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                      </div>
                      <span className="text-[11px] font-medium text-white/35">Dashboard preview</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Groups', icon: Users },
                        { label: 'Assignments', icon: ClipboardCheck },
                        { label: 'Completion', icon: TrendingUp },
                      ].map(({ label, icon: Icon }) => (
                        <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
                          <Icon className="mb-2 h-4 w-4 text-indigo-300" />
                          <p className="text-xl font-bold text-white/25">—</p>
                          <p className="text-[10px] uppercase tracking-wider text-white/40">{label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-10 text-center">
                      <BarChart3 className="mb-3 h-6 w-6 text-indigo-300" />
                      <p className="text-sm font-medium text-white/70">Your workspace</p>
                      <p className="mt-1 text-xs text-white/40">Sign in to see your groups and progress.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="border-y border-white/10 bg-white/[0.03] py-6 backdrop-blur">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-12 gap-y-3 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
              <span>OneDrive links</span>
              <span>Role-based access</span>
              <span>Submission tracking</span>
              <span>Progress overview</span>
            </div>
          </section>

          <section id="features" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-200">
                What it does
              </span>
              <h2 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
                <span className="text-gradient">One place for the whole class.</span>
              </h2>
              <p className="mt-4 text-white/55">Less chasing, more clarity. Built around the way students and professors actually work.</p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, text, tone }, i) => (
                <TiltCard key={title} className="h-full">
                  <div className="card h-full p-7" style={{ animation: `fade-up 0.7s ease-out ${i * 100}ms both` }}>
                    <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} text-white ring-1 ring-white/15`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-white/55">{text}</p>
                  </div>
                </TiltCard>
              ))}
            </div>
          </section>

          <section id="how" className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
            <div className="card p-8 sm:p-12">
              <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-200">
                    <PlayCircle className="h-3.5 w-3.5" /> How it works
                  </span>
                  <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">From group creation to confirmed submission in three steps.</h2>
                  <p className="mt-4 text-white/55">Clear, deliberate and easy to follow — everyone knows where things stand.</p>
                </div>
                <div className="space-y-4">
                  {STEPS.map(({ n, title, text }) => (
                    <div key={n} className="card-soft flex gap-4 rounded-2xl p-4">
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-sm font-bold text-indigo-200">{n}</span>
                      <div>
                        <p className="font-semibold text-white">{title}</p>
                        <p className="mt-1 text-sm text-white/55">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="start" className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
            <div className="card relative overflow-hidden px-8 py-14 text-center sm:px-12">
              <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-fuchsia-500/25 blur-3xl" />
              <div className="relative">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to get your team in sync?</h2>
                <p className="mx-auto mt-4 max-w-xl text-white/60">Choose your role and open your workspace.</p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link to="/login?role=student" className="btn-gradient group">
                    Continue as Student <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                  <Link to="/login?role=professor" className="glass inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
                    <ShieldCheck className="h-4 w-4" /> Continue as Professor
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <footer className="border-t border-white/10 py-8">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 text-xs text-white/35 sm:flex-row sm:px-8">
              <p>Joineazy · Student Group Assignment Management System</p>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" /> React, Node.js and PostgreSQL
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}

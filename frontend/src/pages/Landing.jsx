import { Link } from 'react-router-dom';
import {
  GraduationCap, ShieldCheck, ArrowRight, Sparkles, Users, ClipboardCheck,
  BarChart3, CheckCircle2, Zap, Clock, PlayCircle, TrendingUp, ArrowUpRight,
  Lock as LockIcon,
} from 'lucide-react';
import { AnimatedBackground, TiltCard, useRotatingWord } from '../components/Animated';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: Users,
    title: 'Form your own groups',
    text: 'Create a team in seconds and invite classmates by email or student ID. Everyone sees the same workspace.',
    tone: 'from-indigo-500/25 to-violet-500/10',
  },
  {
    icon: ClipboardCheck,
    title: 'Two-step submission',
    text: 'Confirm with a deliberate two-step flow — acknowledge, then confirm. No accidental or ambiguous submissions.',
    tone: 'from-emerald-500/25 to-teal-500/10',
  },
  {
    icon: BarChart3,
    title: 'Live professor analytics',
    text: 'Professors see completion rates, per-group progress and recent confirmations on one clean dashboard.',
    tone: 'from-fuchsia-500/25 to-pink-500/10',
  },
];

const STEPS = [
  { n: '01', title: 'Sign in with your role', text: 'Students and professors get purpose-built workspaces from the moment they log in.' },
  { n: '02', title: 'Build your team', text: 'Create a group, add members, and see every assignment targeted at you.' },
  { n: '03', title: 'Confirm & track', text: 'Upload to OneDrive, confirm in two steps, and watch progress update instantly.' },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const word = useRotatingWord(['groups', 'submissions', 'progress']);

  return (
    <>
      <AnimatedBackground />
      <div className="relative min-h-screen text-white">
        {/* Nav */}
        <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-xl">
              <GraduationCap className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-lg font-bold leading-tight tracking-tight">SGAMS</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">by Joineazy</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-white/65 md:flex">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#how" className="transition hover:text-white">How it works</a>
            <a href="#start" className="transition hover:text-white">Get started</a>
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <Link to="/dashboard" className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:text-white sm:block">
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

        {/* Hero */}
        <main>
          <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-2 lg:pt-20">
            <div className="animate-fade-up">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5 text-violet-300" />
                Built for modern classrooms
                <span className="ml-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wider">New</span>
              </div>

              <h1 className="text-5xl font-extrabold leading-[1.06] tracking-tight sm:text-6xl xl:text-7xl">
                <span className="text-gradient">Group projects,</span>
                <br />
                <span className="shimmer-text">finally under control.</span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/65">
                SGAMS brings student teams, assignment links and submission confirmations into one calm workspace — and gives professors a real-time view of every group's <span className="font-semibold text-white/90">{word}</span>.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/login?role=student" className="btn-gradient group">
                  <GraduationCap className="h-5 w-5" /> I'm a Student
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to="/login?role=professor" className="glass group inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
                  <ShieldCheck className="h-5 w-5 text-indigo-200" /> I'm a Professor
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-white/50">
                {[
                  { icon: CheckCircle2, label: 'No setup fees' },
                  { icon: LockIcon, label: 'Secure JWT login' },
                  { icon: Zap, label: 'Works instantly' },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-emerald-300" /> {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Floating dashboard mockup */}
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
                      <span className="text-[11px] font-medium text-white/40">sgams.app/dashboard</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Groups', value: '12', icon: Users },
                        { label: 'Assignments', value: '08', icon: ClipboardCheck },
                        { label: 'Completion', value: '76%', icon: TrendingUp },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
                          <Icon className="mb-2 h-4 w-4 text-indigo-300" />
                          <p className="text-xl font-bold text-white">{value}</p>
                          <p className="text-[10px] uppercase tracking-wider text-white/40">{label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">Team progress</p>
                        <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-semibold text-emerald-300">LIVE</span>
                      </div>
                      {[
                        { name: 'The Alchemists', value: 92 },
                        { name: 'Code Crusaders', value: 74 },
                        { name: 'The Innovators', value: 48 },
                      ].map((row) => (
                        <div key={row.name} className="mb-3 last:mb-0">
                          <div className="mb-1.5 flex justify-between text-[11px]">
                            <span className="text-white/70">{row.name}</span>
                            <span className="font-semibold text-white">{row.value}%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-fuchsia-400" style={{ width: `${row.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                      <p className="text-xs text-white/75">The Alchemists confirmed <strong className="text-white">Week 3 Report</strong></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Trust strip */}
          <section className="border-y border-white/10 bg-white/[0.03] py-6 backdrop-blur">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-12 gap-y-3 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
              <span>OneDrive ready</span>
              <span>Role-based access</span>
              <span>Progress analytics</span>
              <span>Built for teams</span>
            </div>
          </section>

          {/* Features */}
          <section id="features" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-200">
                Everything you need
              </span>
              <h2 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
                <span className="text-gradient">One workspace for the whole class.</span>
              </h2>
              <p className="mt-4 text-white/60">Less chasing, more clarity. Designed for the way students and professors actually work.</p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, text, tone }, i) => (
                <TiltCard key={title} className="h-full" >
                  <div className="glass h-full rounded-3xl p-7" style={{ animation: `fade-up 0.7s ease-out ${i * 100}ms both` }}>
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

          {/* How it works */}
          <section id="how" className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
            <div className="glass rounded-3xl p-8 sm:p-12">
              <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-200">
                    <PlayCircle className="h-3.5 w-3.5" /> How it works
                  </span>
                  <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">From group creation to confirmed submission in three steps.</h2>
                  <p className="mt-4 text-white/55">Clear, deliberate and auditable — everyone always knows where things stand.</p>
                </div>
                <div className="space-y-4">
                  {STEPS.map(({ n, title, text }) => (
                    <div key={n} className="glass-soft flex gap-4 rounded-2xl p-4">
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

          {/* Final CTA */}
          <section id="start" className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
            <div className="glass relative overflow-hidden rounded-3xl px-8 py-14 text-center sm:px-12">
              <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-fuchsia-500/25 blur-3xl" />
              <div className="relative">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to get your team in sync?</h2>
                <p className="mx-auto mt-4 max-w-xl text-white/60">Choose your role and step into a cleaner way of managing group assignments.</p>
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
              <p>© 2026 Joineazy · SGAMS intern demonstration project.</p>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" /> Built with React, Node.js & PostgreSQL
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}

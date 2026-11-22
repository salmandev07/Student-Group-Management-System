import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ClipboardList, CheckCircle2, TrendingUp, ArrowRight, ExternalLink, CalendarDays } from 'lucide-react';
import { groupsApi, assignmentsApi, submissionsApi } from '../api';
import { Alert, Badge, EmptyState, LoadingScreen, PageHeader, ProgressBar, StatCard } from '../components/UI';
import { formatDate, daysUntil } from '../utils/format';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([groupsApi.list(), assignmentsApi.list(), submissionsApi.myProgress()])
      .then(([groups, assignments, progress]) => {
        if (active) setData({ groups: groups.groups, assignments: assignments.assignments, progress: progress.summary });
      })
      .catch((err) => active && setError(err.message));
    return () => { active = false; };
  }, []);

  if (error) return <Alert message={error} />;
  if (!data) return <LoadingScreen label="Loading your dashboard..." />;

  const { groups, assignments, progress } = data;
  const confirmed = assignments.reduce(
    (sum, a) => sum + (a.myGroups || []).filter((g) => g.submitted).length,
    0
  );
  const upcoming = [...assignments].slice(0, 4);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]}`}
        subtitle="Here is what is happening with your groups and assignments."
        actions={
          <Link to="/assignments" className="btn-primary btn-sm">
            View assignments <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="My groups" value={groups.length} hint="Groups you belong to" />
        <StatCard icon={ClipboardList} label="Assignments" value={assignments.length} hint="Assigned to your groups" tone="violet" />
        <StatCard icon={CheckCircle2} label="Confirmed" value={confirmed} hint="Submissions confirmed" tone="green" />
        <StatCard icon={TrendingUp} label="Completion" value={`${progress.percent}%`} hint="Overall progress" tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Group progress</h2>
            <Link to="/groups" className="text-xs font-semibold text-indigo-300 transition hover:text-indigo-200">View all</Link>
          </div>
          {groups.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No groups yet"
              description="Create a group to start tracking assignment progress."
              action={<Link to="/groups" className="btn-primary btn-sm">Create a group</Link>}
            />
          ) : (
            <div className="space-y-5">
              {groups.slice(0, 4).map((g) => (
                <div key={g.id}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-white/90">{g.name}</span>
                      <Badge tone="slate">{g.memberCount} members</Badge>
                    </div>
                    <span className="text-xs font-semibold text-white/50">
                      {g.progress?.completed || 0}/{g.progress?.total || 0}
                    </span>
                  </div>
                  <ProgressBar value={g.progress?.percent || 0} showLabel />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Upcoming assignments</h2>
            <Link to="/assignments" className="text-xs font-semibold text-indigo-300 transition hover:text-indigo-200">View all</Link>
          </div>
          {upcoming.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No assignments yet" description="Your professor has not posted any assignments." />
          ) : (
            <div className="divide-y divide-white/[0.07]">
              {upcoming.map((a) => {
                const mine = a.myGroups || [];
                const allDone = mine.length > 0 && mine.every((g) => g.submitted);
                const days = daysUntil(a.dueDate);
                return (
                  <div key={a.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white/90">{a.title}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-white/45">
                        <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(a.dueDate)}</span>
                        <Badge tone={days !== null && days < 0 ? 'red' : days !== null && days <= 3 ? 'amber' : 'slate'}>
                          {days !== null && days < 0 ? 'Overdue' : days === 0 ? 'Due today' : `${days} days left`}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <Badge tone={allDone ? 'green' : 'amber'}>{allDone ? 'Submitted' : 'Pending'}</Badge>
                      <a href={a.oneDriveLink} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-white/40 transition hover:bg-white/10 hover:text-indigo-200" title="Open OneDrive link">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, GraduationCap, ClipboardList, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { adminApi } from '../api';
import { Alert, Badge, Avatar, LoadingScreen, PageHeader, StatCard } from '../components/UI';
import { formatDateTime } from '../utils/format';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([adminApi.overview(), adminApi.analytics()])
      .then(([overview, analytics]) => {
        if (active) {
          setData({
            overview: overview.overview,
            recentSubmissions: overview.recentSubmissions,
            ...analytics.analytics,
          });
        }
      })
      .catch((err) => active && setError(err.message));
    return () => { active = false; };
  }, []);

  if (error) return <Alert message={error} />;
  if (!data) return <LoadingScreen label="Loading analytics..." />;

  const chartData = data.byAssignment.slice(0, 6).map((a) => ({
    name: a.title.length > 18 ? `${a.title.slice(0, 18)}…` : a.title,
    submitted: a.submitted,
    pending: Math.max(0, a.total - a.submitted),
  }));

  return (
    <>
      <PageHeader
        title={`Good morning, ${user?.name?.split(' ').slice(-1)[0]}!`}
        subtitle="Here's the latest across all groups and assignments."
        actions={
          <Link to="/admin/assignments" className="btn-primary">
            Manage assignments <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={GraduationCap} label="Students" value={data.overview.students} hint="Registered accounts" />
        <StatCard icon={Users} label="Groups" value={data.overview.groups} hint="Active teams" tone="violet" />
        <StatCard icon={ClipboardList} label="Assignments" value={data.overview.assignments} hint="Posted by you" tone="amber" />
        <StatCard icon={TrendingUp} label="Completion" value={`${data.summary.completionPercent}%`} hint={`${data.summary.totalSubmitted} of ${data.summary.totalTargets} submissions`} tone="green" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="card p-5 lg:col-span-3">
          <div className="mb-4">
            <h2 className="font-semibold text-slate-900">Submission progress by assignment</h2>
            <p className="text-xs text-slate-500">Confirmed vs. pending groups</p>
          </div>
          {chartData.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">No assignments to chart yet.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Bar dataKey="submitted" name="Submitted" stackId="a" fill="#4f46e5" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="pending" name="Pending" stackId="a" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent submissions</h2>
            <Link to="/admin/analytics" className="text-xs font-semibold text-brand-600 hover:underline">Analytics</Link>
          </div>
          {data.recentSubmissions.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">No submissions confirmed yet.</p>
          ) : (
            <div className="space-y-4">
              {data.recentSubmissions.map((s) => (
                <div key={s.id} className="flex items-start gap-3">
                  <Avatar name={s.confirmedByName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {s.groupName} <span className="font-normal text-slate-400">confirmed</span>
                    </p>
                    <p className="truncate text-xs text-slate-500">{s.assignmentTitle}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{formatDateTime(s.confirmedAt)}</p>
                  </div>
                  <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-emerald-500" />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="card mt-6 overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Group completion overview</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {data.byGroup.map((g) => (
            <div key={g.id} className="flex items-center justify-between gap-4 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-800">{g.name}</span>
                <Badge tone={g.percent === 100 ? 'green' : g.percent > 0 ? 'amber' : 'slate'}>
                  {g.completed}/{g.total} done
                </Badge>
              </div>
              <div className="w-32 sm:w-56">
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: `${g.percent}%` }} />
                </div>
              </div>
              <span className="w-10 text-right text-xs font-semibold text-slate-600">{g.percent}%</span>
            </div>
          ))}
          {data.byGroup.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-400">No groups yet.</p>}
        </div>
      </section>
    </>
  );
}

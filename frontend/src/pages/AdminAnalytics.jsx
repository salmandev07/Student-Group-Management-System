import { useEffect, useState } from 'react';
import { BarChart3, PieChart as PieIcon, Users, CheckCircle2, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { adminApi } from '../api';
import { Alert, Badge, LoadingScreen, PageHeader, StatCard } from '../components/UI';
import { formatDate } from '../utils/format';

const COLORS = ['#818cf8', '#34d399'];
const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(13,19,48,0.95)',
  color: '#fff',
  fontSize: 12,
};

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.analytics().then((d) => setData(d.analytics)).catch((e) => setError(e.message));
  }, []);

  if (error) return <Alert message={error} />;
  if (!data) return <LoadingScreen label="Building analytics..." />;

  const byAssignment = data.byAssignment.map((a) => ({
    name: a.title.length > 20 ? `${a.title.slice(0, 20)}…` : a.title,
    Submitted: a.submitted,
    Pending: Math.max(0, a.total - a.submitted),
  }));
  const pieData = [
    { name: 'Submitted', value: data.summary.totalSubmitted },
    { name: 'Pending', value: Math.max(0, data.summary.totalTargets - data.summary.totalSubmitted) },
  ];

  return (
    <>
      <PageHeader title="Analytics" subtitle="Submission completion and group performance." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={TrendingUp} label="Overall completion" value={`${data.summary.completionPercent}%`} hint="Across all targeted groups" tone="green" />
        <StatCard icon={CheckCircle2} label="Confirmed submissions" value={data.summary.totalSubmitted} hint={`Out of ${data.summary.totalTargets} targets`} />
        <StatCard icon={Users} label="Groups tracked" value={data.byGroup.length} hint="With progress measured" tone="violet" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="card p-5 lg:col-span-3">
          <h2 className="mb-4 flex items-center gap-2 section-title"><BarChart3 className="h-5 w-5 text-indigo-300" /> Submissions by assignment</h2>
          {byAssignment.length === 0 ? (
            <p className="py-10 text-center text-sm text-white/40">No data yet.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byAssignment} margin={{ top: 5, right: 10, left: -15, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }} />
                  <Bar dataKey="Submitted" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Pending" fill="rgba(255,255,255,0.18)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="card p-5 lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 section-title"><PieIcon className="h-5 w-5 text-indigo-300" /> Completion breakdown</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} label={{ fill: '#fff', fontSize: 11 }}>
                  {pieData.map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="card mt-6 overflow-hidden">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="section-title">Group performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-5 py-3 font-semibold">Group</th>
                <th className="px-5 py-3 font-semibold">Completed</th>
                <th className="px-5 py-3 font-semibold">Progress</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.07]">
              {data.byGroup.map((g) => (
                <tr key={g.id} className="transition hover:bg-white/[0.04]">
                  <td className="px-5 py-3 font-medium text-white/90">{g.name}</td>
                  <td className="px-5 py-3 text-white/60">{g.completed} / {g.total}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-28 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400" style={{ width: `${g.percent}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-white/60">{g.percent}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={g.percent === 100 ? 'green' : g.percent > 0 ? 'amber' : 'slate'}>
                      {g.percent === 100 ? 'Complete' : g.percent > 0 ? 'In progress' : 'Not started'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.byGroup.length === 0 && <p className="px-5 py-8 text-center text-sm text-white/40">No groups to display.</p>}
        </div>
      </section>

      <section className="card mt-6 overflow-hidden">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="section-title">Assignment details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-5 py-3 font-semibold">Assignment</th>
                <th className="px-5 py-3 font-semibold">Due date</th>
                <th className="px-5 py-3 font-semibold">Submissions</th>
                <th className="px-5 py-3 font-semibold">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.07]">
              {data.byAssignment.map((a) => (
                <tr key={a.id} className="transition hover:bg-white/[0.04]">
                  <td className="px-5 py-3 font-medium text-white/90">{a.title}</td>
                  <td className="px-5 py-3 text-white/60">{formatDate(a.dueDate)}</td>
                  <td className="px-5 py-3 text-white/60">{a.submitted} / {a.total}</td>
                  <td className="px-5 py-3 font-semibold text-indigo-300">{a.percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

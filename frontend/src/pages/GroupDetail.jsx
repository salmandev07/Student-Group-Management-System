import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UserPlus, Trash2, Mail, Contact, Users, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { groupsApi, assignmentsApi } from '../api';
import {
  Alert, Avatar, Badge, Field, LoadingScreen, Modal, PageHeader,
  ProgressBar, Spinner, StatCard,
} from '../components/UI';
import { formatDate } from '../utils/format';
import { useAuth } from '../context/AuthContext';

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [targeted, setTargeted] = useState([]);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState('email');
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = async () => {
    try {
      const [g, a] = await Promise.all([groupsApi.get(id), assignmentsApi.list()]);
      setGroup(g.group);
      setTargeted(a.assignments.filter((x) => x.targetGroups.some((t) => t.id === Number(id))));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (error) return <Alert message={error} />;
  if (!group) return <LoadingScreen label="Loading group..." />;

  const isOwner = group.owner.id === user?.id;

  const addMember = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = mode === 'email' ? { email: value } : { studentId: value };
      await groupsApi.addMember(id, payload);
      await load();
      setModalOpen(false);
      setValue('');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeMember = async (userId, name) => {
    const label = userId === user.id ? 'leave this group' : `remove ${name}`;
    if (!window.confirm(`Are you sure you want to ${label}?`)) return;
    try {
      await groupsApi.removeMember(id, userId);
      if (userId === user.id) navigate('/groups');
      else await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Link to="/groups" className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> Back to groups
      </Link>

      <PageHeader
        title={group.name}
        subtitle={`Created by ${group.owner.name} · ${formatDate(group.createdAt)}`}
        actions={<button className="btn-primary" onClick={() => setModalOpen(true)}><UserPlus className="h-4 w-4" /> Add member</button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Members" value={group.members.length} />
        <StatCard icon={CheckCircle2} label="Confirmed" value={group.progress.completed} tone="green" />
        <StatCard icon={Clock} label="Completion" value={`${group.progress.percent}%`} tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="card p-5 lg:col-span-2">
          <h2 className="mb-4 font-semibold text-slate-900">Group progress</h2>
          <ProgressBar value={group.progress.percent} showLabel size="lg" />
          <p className="mt-3 text-sm text-slate-500">
            {group.progress.completed} of {group.progress.total} assigned assignments confirmed.
          </p>
        </section>

        <section className="card overflow-hidden lg:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Members</h2>
            <Badge tone="slate">{group.members.length} people</Badge>
          </div>
          <ul className="divide-y divide-slate-100">
            {group.members.map((m) => (
              <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={m.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {m.name} {m.id === group.owner.id && <Badge tone="brand">Owner</Badge>}
                    {m.id === user?.id && <span className="ml-1 text-xs text-slate-400">(you)</span>}
                  </p>
                  <p className="truncate text-xs text-slate-500">{m.email}{m.studentId ? ` · ${m.studentId}` : ''}</p>
                </div>
                {(isOwner && m.id !== user.id) || (!isOwner && m.id === user.id) ? (
                  <button
                    onClick={() => removeMember(m.id, m.name)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    title={m.id === user.id ? 'Leave group' : 'Remove member'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card mt-6 overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Assigned work & status</h2>
        </div>
        {targeted.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-400">No assignments target this group yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {targeted.map((a) => {
              const mine = (a.myGroups || []).find((g) => g.groupId === Number(id));
              const done = Boolean(mine?.submitted);
              return (
                <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800">{a.title}</p>
                    <p className="text-xs text-slate-400">Due {formatDate(a.dueDate)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={done ? 'green' : 'amber'}>
                      {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                      {done ? 'Submitted' : 'Pending'}
                    </Badge>
                    <a href={a.oneDriveLink} target="_blank" rel="noreferrer" className="btn-ghost p-2" title="Open OneDrive link">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add a group member"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={addMember} disabled={saving}>
              {saving ? <Spinner /> : 'Add member'}
            </button>
          </>
        }
      >
        <form onSubmit={addMember}>
          <Alert message={formError} />
          <div className="mb-4 flex gap-2 rounded-lg bg-slate-100 p-1">
            <button type="button" onClick={() => { setMode('email'); setValue(''); }} className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium ${mode === 'email' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'}`}>
              <Mail className="h-4 w-4" /> Email
            </button>
            <button type="button" onClick={() => { setMode('studentId'); setValue(''); }} className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium ${mode === 'studentId' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'}`}>
              <Contact className="h-4 w-4" /> Student ID
            </button>
          </div>
          <Field label={mode === 'email' ? 'Student email' : 'Student ID'}>
            <input
              className="input"
              autoFocus
              placeholder={mode === 'email' ? 'classmate@student.com' : 'STU002'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </Field>
          <p className="mt-3 text-xs text-slate-500">The student must already have an account registered on SGAMS.</p>
        </form>
      </Modal>
    </>
  );
}

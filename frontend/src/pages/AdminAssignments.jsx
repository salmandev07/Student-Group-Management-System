import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ExternalLink, Users, CalendarDays, BarChart3 } from 'lucide-react';
import { assignmentsApi, adminApi } from '../api';
import {
  Alert, Badge, EmptyState, Field, LoadingScreen, Modal,
  PageHeader, ProgressBar, Spinner,
} from '../components/UI';
import { formatDate } from '../utils/format';

const emptyForm = {
  title: '', description: '', dueDate: '', oneDriveLink: '', targetType: 'all', groupIds: [],
};

export default function AdminAssignments() {
  const [assignments, setAssignments] = useState(null);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = () =>
    Promise.all([assignmentsApi.list(), adminApi.groups()])
      .then(([a, g]) => { setAssignments(a.assignments); setGroups(g.groups); })
      .catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  if (error) return <Alert message={error} />;
  if (!assignments) return <LoadingScreen label="Loading assignments..." />;

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormError(''); setModalOpen(true); };
  const openEdit = (a) => {
    setEditing(a);
    setForm({
      title: a.title,
      description: a.description || '',
      dueDate: a.dueDate ? new Date(a.dueDate).toISOString().slice(0, 10) : '',
      oneDriveLink: a.oneDriveLink,
      targetType: a.targetType,
      groupIds: a.targetGroups.map((g) => g.id),
    });
    setFormError('');
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        title: form.title,
        description: form.description,
        dueDate: form.dueDate,
        oneDriveLink: form.oneDriveLink,
        targetType: form.targetType,
        groupIds: form.targetType === 'groups' ? form.groupIds : [],
      };
      if (editing) await assignmentsApi.update(editing.id, payload);
      else await assignmentsApi.create(payload);
      await load();
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (a) => {
    if (!window.confirm(`Delete "${a.title}"? All its confirmations will be removed too.`)) return;
    try {
      await assignmentsApi.remove(a.id);
      setAssignments((prev) => prev.filter((x) => x.id !== a.id));
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleGroup = (id) =>
    setForm((prev) => ({
      ...prev,
      groupIds: prev.groupIds.includes(id)
        ? prev.groupIds.filter((g) => g !== id)
        : [...prev.groupIds, id],
    }));

  return (
    <>
      <PageHeader
        title="Assignments"
        subtitle="Create, edit and monitor assignments for your students."
        actions={<button className="btn-primary" onClick={openCreate}><Plus className="h-4 w-4" /> New assignment</button>}
      />

      <Alert message={error} onClose={() => setError('')} />

      {assignments.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No assignments yet"
          description="Post your first assignment and share a OneDrive submission link."
          action={<button className="btn-primary" onClick={openCreate}><Plus className="h-4 w-4" /> Create assignment</button>}
        />
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <article key={a.id} className="card p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">{a.title}</h3>
                    <Badge tone={a.targetType === 'all' ? 'brand' : 'violet'}>
                      {a.targetType === 'all' ? 'All students' : `${a.targetGroups.length} group(s)`}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-sm text-slate-600">{a.description || 'No description provided.'}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Due {formatDate(a.dueDate)}</span>
                    <a href={a.oneDriveLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-semibold text-brand-600 hover:underline">
                      <ExternalLink className="h-3.5 w-3.5" /> OneDrive link
                    </a>
                    {a.createdBy && <span>Posted by {a.createdBy.name}</span>}
                  </div>
                </div>
                <div className="flex flex-shrink-0 gap-2">
                  <button className="btn-secondary px-3 py-2" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /> Edit</button>
                  <button className="btn-ghost px-3 py-2 text-red-500 hover:bg-red-50" onClick={() => remove(a)}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 font-semibold text-slate-600"><BarChart3 className="h-3.5 w-3.5" /> Submission progress</span>
                    <span className="font-semibold text-slate-700">{a.stats.submitted}/{a.stats.total} · {a.stats.percent}%</span>
                  </div>
                  <ProgressBar value={a.stats.percent} size="sm" />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Users className="h-4 w-4 text-slate-400" />
                  {a.targetType === 'all' ? (
                    <Badge tone="slate">All groups</Badge>
                  ) : (
                    a.targetGroups.map((g) => <Badge key={g.id} tone="slate">{g.name}</Badge>)
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit assignment' : 'Create assignment'}
        maxWidth="max-w-2xl"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>
              {saving ? <Spinner /> : editing ? 'Save changes' : 'Create assignment'}
            </button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <Alert message={formError} />
          <Field label="Title">
            <input className="input" placeholder="e.g. Week 4 – Database Design" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </Field>
          <Field label="Description">
            <textarea className="input min-h-[90px] resize-y" placeholder="What should students submit?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Due date">
              <input type="date" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
            </Field>
            <Field label="OneDrive submission link">
              <input type="url" className="input" placeholder="https://onedrive.live.com/..." value={form.oneDriveLink} onChange={(e) => setForm({ ...form, oneDriveLink: e.target.value })} required />
            </Field>
          </div>
          <Field label="Assign to">
            <div className="flex gap-2">
              {['all', 'groups'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, targetType: t })}
                  className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${form.targetType === t ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {t === 'all' ? 'All students' : 'Specific groups'}
                </button>
              ))}
            </div>
          </Field>
          {form.targetType === 'groups' && (
            <Field label="Select groups" hint="Choose one or more groups for this assignment.">
              <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3">
                {groups.length === 0 && <p className="text-sm text-slate-400">No groups have been created yet.</p>}
                {groups.map((g) => (
                  <label key={g.id} className="flex cursor-pointer items-center gap-2.5 rounded-md p-1.5 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={form.groupIds.includes(g.id)}
                      onChange={() => toggleGroup(g.id)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm text-slate-700">{g.name}</span>
                    <span className="text-xs text-slate-400">({g.memberCount} members)</span>
                  </label>
                ))}
              </div>
            </Field>
          )}
        </form>
      </Modal>
    </>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, ArrowRight, UserPlus, Trash2 } from 'lucide-react';
import { groupsApi } from '../api';
import {
  Alert, Avatar, Badge, EmptyState, Field, LoadingScreen, Modal,
  PageHeader, ProgressBar, Spinner,
} from '../components/UI';
import { formatDate } from '../utils/format';
import { useAuth } from '../context/AuthContext';

export default function Groups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState(null);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = () => groupsApi.list().then((d) => setGroups(d.groups)).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const res = await groupsApi.create({ name });
      setGroups((prev) => [res.group, ...prev]);
      setCreateOpen(false);
      setName('');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this group? This cannot be undone.')) return;
    try {
      await groupsApi.remove(id);
      setGroups((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) return <Alert message={error} />;
  if (!groups) return <LoadingScreen label="Loading groups..." />;

  return (
    <>
      <PageHeader
        title="My Groups"
        subtitle="Create a team, add members, and track your shared progress."
        actions={<button className="btn-primary" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> New group</button>}
      />

      {groups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="You haven't joined a group yet"
          description="Create your own group and invite classmates using their email or student ID."
          action={<button className="btn-primary" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> Create your first group</button>}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((g) => {
            const isOwner = g.createdBy === user?.id;
            return (
              <div key={g.id} className="card flex flex-col p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{g.name}</h3>
                      <p className="text-xs text-slate-400">Created {formatDate(g.createdAt)}</p>
                    </div>
                  </div>
                  {isOwner && <Badge tone="brand">Owner</Badge>}
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-slate-500"><UserPlus className="h-4 w-4" /> {g.memberCount} members</span>
                    <span className="font-semibold text-slate-700">{g.progress?.percent || 0}%</span>
                  </div>
                  <ProgressBar value={g.progress?.percent || 0} />
                  <p className="mt-2 text-xs text-slate-400">
                    {g.progress?.completed || 0} of {g.progress?.total || 0} assignments confirmed
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                  <Link to={`/groups/${g.id}`} className="btn-secondary flex-1">
                    Manage <ArrowRight className="h-4 w-4" />
                  </Link>
                  {isOwner && (
                    <button onClick={() => remove(g.id)} className="btn-ghost text-red-500 hover:bg-red-50" title="Delete group">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create a new group"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={create} disabled={saving}>
              {saving ? <Spinner /> : 'Create group'}
            </button>
          </>
        }
      >
        <form onSubmit={create}>
          <Alert message={formError} />
          <Field label="Group name" hint="Pick something your teammates will recognise.">
            <input
              className="input"
              autoFocus
              placeholder="e.g. The Alchemists"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Field>
          <p className="mt-3 text-xs text-slate-500">
            You'll be added as the first member and owner. You can invite others next.
          </p>
        </form>
      </Modal>
    </>
  );
}

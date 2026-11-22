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
        subtitle="Create a team, add members and track your shared progress."
        actions={<button className="btn-primary btn-sm" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> New group</button>}
      />

      {groups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="You haven't joined a group yet"
          description="Create a group and invite classmates by email or student ID."
          action={<button className="btn-primary" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> Create your first group</button>}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((g) => {
            const isOwner = g.createdBy === user?.id;
            return (
              <div key={g.id} className="card group p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-200 ring-1 ring-indigo-400/20">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{g.name}</h3>
                      <p className="text-xs text-white/35">Created {formatDate(g.createdAt)}</p>
                    </div>
                  </div>
                  {isOwner && <Badge tone="brand">Owner</Badge>}
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-white/50"><UserPlus className="h-4 w-4" /> {g.memberCount} members</span>
                    <span className="font-semibold text-white">{g.progress?.percent || 0}%</span>
                  </div>
                  <ProgressBar value={g.progress?.percent || 0} />
                  <p className="mt-2 text-xs text-white/35">
                    {g.progress?.completed || 0} of {g.progress?.total || 0} assignments confirmed
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-2 border-t border-white/[0.08] pt-4">
                  <Link to={`/groups/${g.id}`} className="btn-secondary flex-1 btn-sm">
                    Manage <ArrowRight className="h-4 w-4" />
                  </Link>
                  {isOwner && (
                    <button onClick={() => remove(g.id)} className="btn-ghost p-2 text-red-300 hover:bg-red-500/10" title="Delete group">
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
          <p className="mt-3 text-sm text-white/45">
            You will be added as the first member and owner. You can invite others next.
          </p>
        </form>
      </Modal>
    </>
  );
}

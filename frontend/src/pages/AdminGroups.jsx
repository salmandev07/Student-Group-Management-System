import { useEffect, useState } from 'react';
import { Users, UserPlus } from 'lucide-react';
import { adminApi } from '../api';
import { Alert, Badge, EmptyState, LoadingScreen, PageHeader, ProgressBar } from '../components/UI';
import { formatDate } from '../utils/format';

export default function AdminGroups() {
  const [groups, setGroups] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.groups().then((d) => setGroups(d.groups)).catch((e) => setError(e.message));
  }, []);

  if (error) return <Alert message={error} />;
  if (!groups) return <LoadingScreen label="Loading groups..." />;

  return (
    <>
      <PageHeader title="Groups" subtitle={`${groups.length} group(s) created by students.`} />
      {groups.length === 0 ? (
        <EmptyState icon={Users} title="No groups yet" description="Groups appear here once students create them." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((g) => (
            <div key={g.id} className="card p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white">{g.name}</h3>
                  <p className="text-xs text-white/35">Led by {g.ownerName} · {formatDate(g.createdAt)}</p>
                </div>
                <Badge tone="brand" icon={UserPlus}>{g.memberCount}</Badge>
              </div>
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-white/50">Completion</span>
                  <span className="font-semibold text-white/85">{g.progress?.percent || 0}%</span>
                </div>
                <ProgressBar value={g.progress?.percent || 0} />
                <p className="mt-2 text-xs text-white/35">
                  {g.progress?.completed || 0}/{g.progress?.total || 0} assignments confirmed
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

import { useEffect, useState } from 'react';
import { GraduationCap, Users, CheckCircle2 } from 'lucide-react';
import { adminApi } from '../api';
import { Alert, Avatar, EmptyState, LoadingScreen, PageHeader } from '../components/UI';
import { formatDate } from '../utils/format';

export default function AdminStudents() {
  const [students, setStudents] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.students().then((d) => setStudents(d.students)).catch((e) => setError(e.message));
  }, []);

  if (error) return <Alert message={error} />;
  if (!students) return <LoadingScreen label="Loading students..." />;

  return (
    <>
      <PageHeader title="Students" subtitle={`${students.length} registered student(s).`} />
      {students.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No students yet" description="Students appear here after they register." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-white/40">
                <tr>
                  <th className="px-5 py-3 font-semibold">Student</th>
                  <th className="px-5 py-3 font-semibold">Student ID</th>
                  <th className="px-5 py-3 font-semibold"><span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Groups</span></th>
                  <th className="px-5 py-3 font-semibold"><span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Confirmations</span></th>
                  <th className="px-5 py-3 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.07]">
                {students.map((s) => (
                  <tr key={s.id} className="transition hover:bg-white/[0.04]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.name} size="sm" />
                        <div>
                          <p className="font-medium text-white/90">{s.name}</p>
                          <p className="text-xs text-white/40">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-white/60">{s.studentId || '—'}</td>
                    <td className="px-5 py-3 text-white/60">{s.groupCount}</td>
                    <td className="px-5 py-3 text-white/60">{s.submissionCount}</td>
                    <td className="px-5 py-3 text-xs text-white/45">{formatDate(s.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

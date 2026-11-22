import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, CalendarDays, CheckCircle2, Clock, Search, AlertTriangle, Undo2 } from 'lucide-react';
import { assignmentsApi, submissionsApi } from '../api';
import {
  Alert, Badge, EmptyState, LoadingScreen, Modal, PageHeader, ProgressBar, Spinner,
} from '../components/UI';
import { formatDate, daysUntil } from '../utils/format';

export default function Assignments() {
  const [assignments, setAssignments] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [target, setTarget] = useState(null); // { assignment, group }
  const [step, setStep] = useState(1);
  const [ack, setAck] = useState(false);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  const load = () => assignmentsApi.list().then((d) => setAssignments(d.assignments)).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!assignments) return [];
    return assignments.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        (a.description || '').toLowerCase().includes(search.toLowerCase());
      const mine = a.myGroups || [];
      const matchesFilter =
        filter === 'all' ||
        (filter === 'submitted' && mine.some((g) => g.submitted)) ||
        (filter === 'pending' && mine.some((g) => !g.submitted));
      return matchesSearch && matchesFilter;
    });
  }, [assignments, search, filter]);

  if (error) return <Alert message={error} />;
  if (!assignments) return <LoadingScreen label="Loading assignments..." />;

  const openConfirm = (assignment, group) => {
    setTarget({ assignment, group });
    setStep(1);
    setAck(false);
    setNote('');
    setActionError('');
  };

  const closeModal = () => { setTarget(null); setActionError(''); };

  const confirm = async () => {
    if (!target) return;
    setSubmitting(true);
    setActionError('');
    try {
      await submissionsApi.confirm({
        assignmentId: target.assignment.id,
        groupId: target.group.groupId,
        confirm: true,
        note: note || null,
      });
      await load();
      closeModal();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const withdraw = async (assignment, group) => {
    if (!window.confirm(`Withdraw the submission confirmation for "${group.groupName}"?`)) return;
    try {
      await submissionsApi.withdraw(assignment.id, group.groupId);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Assignments"
        subtitle="View your assignments, access OneDrive links, and confirm submissions."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-10"
            placeholder="Search assignments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {['all', 'pending', 'submitted'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium capitalize transition sm:flex-none ${filter === f ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <Alert message={error} onClose={() => setError('')} />

      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No assignments found"
          description={search || filter !== 'all' ? 'Try changing your search or filter.' : "Your professor hasn't posted any assignments for your groups yet."}
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filtered.map((a) => {
            const mine = a.myGroups || [];
            const allDone = mine.length > 0 && mine.every((g) => g.submitted);
            const days = daysUntil(a.dueDate);
            return (
              <article key={a.id} className="card flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900">{a.title}</h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Due {formatDate(a.dueDate)}</span>
                      <Badge tone={days !== null && days < 0 ? 'red' : days !== null && days <= 3 ? 'amber' : 'slate'}>
                        {days !== null && days < 0 ? 'Overdue' : days === 0 ? 'Due today' : `${days} days left`}
                      </Badge>
                      <Badge tone={allDone ? 'green' : 'brand'}>{allDone ? 'Complete' : 'Active'}</Badge>
                    </div>
                  </div>
                  <a
                    href={a.oneDriveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary flex-shrink-0 px-3 py-2 text-xs"
                    title="Open the OneDrive upload folder"
                  >
                    <ExternalLink className="h-4 w-4" /> OneDrive
                  </a>
                </div>

                {a.description && <p className="mt-3 text-sm leading-relaxed text-slate-600">{a.description}</p>}

                <div className="mt-4 rounded-lg bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">Overall progress</span>
                    <span className="font-semibold text-slate-700">{a.stats.submitted}/{a.stats.total} groups</span>
                  </div>
                  <ProgressBar value={a.stats.percent} size="sm" />
                </div>

                <div className="mt-4 flex-1">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Your groups</p>
                  <div className="space-y-2">
                    {mine.length === 0 && <p className="text-sm text-slate-400">This assignment isn't assigned to your groups.</p>}
                    {mine.map((g) => (
                      <div key={g.groupId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          {g.submitted ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-amber-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-slate-800">{g.groupName}</p>
                            {g.submitted && (
                              <p className="text-[11px] text-slate-400">Confirmed by {g.confirmedBy} · {formatDate(g.confirmedAt)}</p>
                            )}
                          </div>
                        </div>
                        {g.submitted ? (
                          <button onClick={() => withdraw(a, g)} className="btn-ghost px-2 py-1.5 text-xs text-slate-500">
                            <Undo2 className="h-3.5 w-3.5" /> Withdraw
                          </button>
                        ) : (
                          <button onClick={() => openConfirm(a, g)} className="btn-primary px-3 py-1.5 text-xs">
                            Confirm submission
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Two-step confirmation modal */}
      <Modal
        open={Boolean(target)}
        onClose={closeModal}
        title={step === 1 ? 'Step 1 of 2 · Verify your submission' : 'Step 2 of 2 · Final confirmation'}
        footer={
          step === 1 ? (
            <>
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" disabled={!ack} onClick={() => { setStep(2); setActionError(''); }}>
                Yes, I have submitted <span className="text-xs opacity-70">→</span>
              </button>
            </>
          ) : (
            <>
              <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button className="btn-primary" onClick={confirm} disabled={submitting}>
                {submitting ? <Spinner /> : 'Confirm submission'}
              </button>
            </>
          )
        }
      >
        <Alert message={actionError} />
        {target && (
          <div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">{target.assignment.title}</p>
              <p className="mt-1 text-xs text-slate-500">Group: <strong className="text-slate-700">{target.group.groupName}</strong></p>
              <a href={target.assignment.oneDriveLink} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline">
                <ExternalLink className="h-3.5 w-3.5" /> Open OneDrive link
              </a>
            </div>

            {step === 1 ? (
              <div className="mt-5">
                <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                  <p className="text-sm text-amber-800">
                    Only confirm after your group has actually uploaded the work to the OneDrive link above.
                    Your professor will be notified immediately.
                  </p>
                </div>
                <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={ack}
                    onChange={(e) => setAck(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm text-slate-700">
                    I confirm that my group has uploaded the assignment to OneDrive and I am ready to submit.
                  </span>
                </label>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <p className="text-sm text-emerald-800">Everything looks good. Click <strong>Final confirm</strong> to record the submission.</p>
                </div>
                <div>
                  <label className="label">Note for the professor <span className="font-normal text-slate-400">(optional)</span></label>
                  <textarea
                    className="input min-h-[80px] resize-y"
                    placeholder="e.g. Uploaded the final PDF and diagrams."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

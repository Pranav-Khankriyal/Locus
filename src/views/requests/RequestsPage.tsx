import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Plus,
  Check,
  Clock,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import type {
  OrgRequest,
  RequestCategory,
  RequestPriority,
  RequestStatus,
} from '@/types';
import { useQuery } from '@/hooks/useQuery';
import { useSession } from '@/hooks/useSession';
import { useNotifications } from '@/hooks/useNotifications';
import { RequestService } from '@/services/RequestService';
import { ReferenceService } from '@/services/ReferenceService';
import { PageHeading, Panel, QueryState } from '@/components/ui/Page';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { can } from '@/utils/permissions';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate, initials } from '@/utils/formatDate';

const CATEGORIES: RequestCategory[] = [
  'Asset Request',
  'Attendance Regularization',
  'Expense Reimbursement',
  'PF Advance / KYC',
  'Salary Advance / Bonus',
  'HR Document / NOC',
  'Access Elevation',
  'General',
];

const PRIORITIES: RequestPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

function priorityStyle(p: RequestPriority) {
  switch (p) {
    case 'Urgent':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'High':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Medium':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

export default function RequestsPage() {
  const { user, permissions } = useSession();
  const { toast } = useNotifications();
  const canManage =
    can(permissions, 'employees', 'manage') || can(permissions, 'payroll', 'manage');

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [busy, setBusy] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    employeeId: user?.id || '',
    category: 'Asset Request' as RequestCategory,
    priority: 'Medium' as RequestPriority,
    title: '',
    amount: '',
    description: '',
  });

  const [reviewTarget, setReviewTarget] = useState<OrgRequest | null>(null);
  const [reviewForm, setReviewForm] = useState({
    status: 'Approved' as RequestStatus,
    reviewerNotes: '',
  });

  const query = useQuery(async () => {
    const [requests, refs] = await Promise.all([
      RequestService.list({
        employeeId: canManage ? undefined : user?.id,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
      }),
      ReferenceService.list(),
    ]);
    return { requests, refs };
  }, `${categoryFilter}:${statusFilter}:${canManage}:${user?.id}`);

  const d = query.data;
  const empMap = Object.fromEntries((d?.refs.employees || []).map((e) => [e.id, e]));

  const filteredRequests = (d?.requests || []).filter((r) => {
    if (priorityFilter && r.priority !== priorityFilter) return false;
    if (!search.trim()) return true;
    const emp = empMap[r.employeeId];
    const q = search.toLowerCase();
    return (
      r.requestNumber.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      (emp?.name || '').toLowerCase().includes(q)
    );
  });

  const pendingCount = filteredRequests.filter((r) => r.status === 'Pending').length;
  const inReviewCount = filteredRequests.filter((r) => r.status === 'In Review').length;
  const approvedCount = filteredRequests.filter((r) => r.status === 'Approved').length;
  const claimValue = filteredRequests.reduce((sum, r) => sum + (r.amount || 0), 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmp = form.employeeId || user?.id;
    if (!targetEmp) return;
    setBusy(true);
    try {
      await RequestService.create({
        employeeId: targetEmp,
        category: form.category,
        priority: form.priority,
        title: form.title.trim(),
        description: form.description.trim(),
        ...(form.amount.trim() ? { amount: Math.max(0, Number(form.amount) || 0) } : {}),
      });
      toast('Organization request submitted');
      setCreateOpen(false);
      setForm({
        employeeId: user?.id || '',
        category: 'Asset Request',
        priority: 'Medium',
        title: '',
        amount: '',
        description: '',
      });
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTarget || !user?.id) return;
    setBusy(true);
    try {
      await RequestService.review(
        reviewTarget.id,
        reviewForm.status,
        user.id,
        reviewForm.reviewerNotes.trim() || undefined
      );
      toast(`Request marked ${reviewForm.status}`);
      setReviewTarget(null);
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleQuickApprove = async (req: OrgRequest) => {
    if (!user?.id) return;
    setBusy(true);
    try {
      await RequestService.review(req.id, 'Approved', user.id);
      toast(`${req.requestNumber} approved`);
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (req: OrgRequest) => {
    setBusy(true);
    try {
      await RequestService.remove(req.id);
      toast(`${req.requestNumber} withdrawn`);
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeading
        title="Requests"
        actions={
          <Button
            onClick={() => {
              setForm((f) => ({ ...f, employeeId: user?.id || '' }));
              setCreateOpen(true);
            }}
          >
            <Plus size={16} /> New Request
          </Button>
        }
      />

      <QueryState query={query}>
        {d && (
          <>
            {/* Summary Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                <span className="text-xs font-medium text-slate-500">
                  Pending Triage
                </span>
                <p className="text-2xl font-semibold tabular-nums text-amber-600 mt-1.5">{pendingCount}</p>
              </div>
              <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                <span className="text-xs font-medium text-slate-500">
                  In Review
                </span>
                <p className="text-2xl font-semibold tabular-nums text-sky-700 mt-1.5">{inReviewCount}</p>
              </div>
              <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                <span className="text-xs font-medium text-slate-500">
                  Approved
                </span>
                <p className="text-2xl font-semibold tabular-nums text-[#107C41] mt-1.5">{approvedCount}</p>
              </div>
              <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                <span className="text-xs font-medium text-slate-500">
                  Claims / Advances Value
                </span>
                <p className="text-2xl font-semibold tabular-nums text-zinc-900 mt-1.5">
                  {formatCurrency(claimValue)}
                </p>
              </div>
            </div>

            <Panel>
              <div className="filters">
                <Input
                  label="Search"
                  placeholder="REQ-#, title, employee, details…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Select
                  label="Category"
                  placeholder="All categories"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                />
                <Select
                  label="Status"
                  placeholder="All statuses"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'Pending', label: 'Pending' },
                    { value: 'In Review', label: 'In Review' },
                    { value: 'Approved', label: 'Approved' },
                    { value: 'Rejected', label: 'Rejected' },
                  ]}
                />
                <Select
                  label="Priority"
                  placeholder="All priorities"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  options={PRIORITIES.map((p) => ({ value: p, label: p }))}
                />
              </div>

              <Table<OrgRequest>
                caption="Organization workflow requests"
                rows={filteredRequests}
                columns={[
                  {
                    key: 'req',
                    title: 'Request #',
                    render: (r) => (
                      <div>
                        <div className="font-mono text-xs font-bold text-gray-900">
                          {r.requestNumber}
                        </div>
                        <span
                          className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityStyle(
                            r.priority
                          )}`}
                        >
                          {r.priority}
                        </span>
                      </div>
                    ),
                  },
                  {
                    key: 'employee',
                    title: 'Requester',
                    render: (r) => {
                      const emp = empMap[r.employeeId];
                      return (
                        <Link
                          to={`/employees/${r.employeeId}?tab=Requests`}
                          className="inline-flex items-center gap-2 font-semibold text-gray-900 hover:text-[#107C41]"
                        >
                          <span className="w-7 h-7 rounded-full bg-emerald-50 text-[#107C41] text-[11px] font-bold flex items-center justify-center border border-emerald-200 shrink-0">
                            {initials(emp?.name)}
                          </span>
                          <span>
                            {emp?.name || r.employeeId}
                            <small className="block text-[11px] font-normal text-gray-400">
                              {emp?.designation}
                            </small>
                          </span>
                        </Link>
                      );
                    },
                  },
                  {
                    key: 'subject',
                    title: 'Category & Subject',
                    render: (r) => (
                      <div className="max-w-sm">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#107C41]">
                          {r.category}
                        </div>
                        <div className="font-semibold text-gray-900 text-sm">{r.title}</div>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                          {r.description}
                        </p>
                        {r.reviewerNotes && (
                          <p className="text-xs text-emerald-700 bg-emerald-50/60 px-2 py-1 rounded mt-1">
                            Review: {r.reviewerNotes}
                          </p>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: 'amount',
                    title: 'Amount',
                    render: (r) =>
                      r.amount ? (
                        <strong className="text-gray-900">{formatCurrency(r.amount)}</strong>
                      ) : (
                        <span className="text-gray-400">—</span>
                      ),
                  },
                  {
                    key: 'date',
                    title: 'Submitted',
                    render: (r) => (
                      <span className="text-xs text-gray-600">{formatDate(r.createdAt)}</span>
                    ),
                  },
                  {
                    key: 'status',
                    title: 'Status',
                    render: (r) => <Badge>{r.status}</Badge>,
                  },
                  {
                    key: 'actions',
                    title: 'Actions',
                    render: (r) => (
                      <div className="inline-flex items-center gap-1.5">
                        {canManage &&
                          (r.status === 'Pending' || r.status === 'In Review') && (
                            <>
                              <Button disabled={busy} onClick={() => handleQuickApprove(r)}>
                                <Check size={14} /> Approve
                              </Button>
                              <Button
                                variant="outline"
                                disabled={busy}
                                onClick={() => {
                                  setReviewTarget(r);
                                  setReviewForm({
                                    status: 'In Review',
                                    reviewerNotes: r.reviewerNotes || '',
                                  });
                                }}
                              >
                                <MessageSquare size={14} /> Triage
                              </Button>
                            </>
                          )}
                        {!canManage && r.status === 'Pending' && r.employeeId === user?.id && (
                          <Button
                            variant="ghost"
                            disabled={busy}
                            onClick={() => handleDelete(r)}
                            title="Withdraw request"
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                        {canManage &&
                          (r.status === 'Approved' || r.status === 'Rejected') && (
                            <Button
                              variant="ghost"
                              disabled={busy}
                              onClick={() => {
                                setReviewTarget(r);
                                setReviewForm({
                                  status: r.status,
                                  reviewerNotes: r.reviewerNotes || '',
                                });
                              }}
                            >
                              Details
                            </Button>
                          )}
                      </div>
                    ),
                  },
                ]}
              />
            </Panel>
          </>
        )}
      </QueryState>

      {/* New Request Modal */}
      {createOpen && (
        <Modal title="New Organization Request" onClose={() => setCreateOpen(false)} busy={busy}>
          <form onSubmit={handleCreate}>
            <div className="modal-body">
              <div className="form-grid">
                {canManage && d?.refs.employees && (
                  <Select
                    label="Requested For"
                    value={form.employeeId}
                    onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
                    options={d.refs.employees.map((emp) => ({
                      value: emp.id,
                      label: `${emp.name} (${emp.employeeId})`,
                    }))}
                  />
                )}
                <Select
                  label="Category"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value as RequestCategory }))
                  }
                  options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                />
                <Select
                  label="Priority"
                  value={form.priority}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, priority: e.target.value as RequestPriority }))
                  }
                  options={PRIORITIES.map((p) => ({ value: p, label: p }))}
                />
                <Input
                  label="Amount (INR, optional)"
                  type="number"
                  min="0"
                  placeholder="For reimbursements / advances"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div className="mt-4 space-y-3">
                <Input
                  label="Title"
                  required
                  placeholder="Short summary of your request…"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
                <label className="field">
                  <span>Details</span>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide dates, asset specifications, bill details, or justification…"
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="ghost" onClick={() => setCreateOpen(false)} disabled={busy}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                <ClipboardList size={15} /> Submit Request
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Triage / Review Modal */}
      {reviewTarget && (
        <Modal
          title={`Review ${reviewTarget.requestNumber}`}
          onClose={() => setReviewTarget(null)}
          busy={busy}
        >
          <form onSubmit={handleReviewSubmit}>
            <div className="modal-body space-y-4">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/80 text-sm">
                <div className="text-[11px] font-bold uppercase text-[#107C41]">
                  {reviewTarget.category} · {empMap[reviewTarget.employeeId]?.name}
                </div>
                <div className="font-bold text-gray-900 mt-0.5">{reviewTarget.title}</div>
                <p className="text-xs text-gray-600 mt-1">{reviewTarget.description}</p>
                {reviewTarget.amount ? (
                  <p className="text-xs font-bold text-gray-900 mt-2">
                    Amount Requested: {formatCurrency(reviewTarget.amount)}
                  </p>
                ) : null}
              </div>

              <Select
                label="Decision Status"
                value={reviewForm.status}
                onChange={(e) =>
                  setReviewForm((f) => ({ ...f, status: e.target.value as RequestStatus }))
                }
                options={[
                  { value: 'Pending', label: 'Pending' },
                  { value: 'In Review', label: 'In Review' },
                  { value: 'Approved', label: 'Approved' },
                  { value: 'Rejected', label: 'Rejected' },
                ]}
              />

              <label className="field">
                <span>Reviewer Notes</span>
                <textarea
                  rows={3}
                  placeholder="Approval notes, reference ID, or reason…"
                  value={reviewForm.reviewerNotes}
                  onChange={(e) =>
                    setReviewForm((f) => ({ ...f, reviewerNotes: e.target.value }))
                  }
                />
              </label>
            </div>
            <div className="modal-footer">
              <Button variant="ghost" onClick={() => setReviewTarget(null)} disabled={busy}>
                Close
              </Button>
              {canManage && (
                <Button type="submit" disabled={busy}>
                  <Clock size={14} /> Update Request
                </Button>
              )}
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

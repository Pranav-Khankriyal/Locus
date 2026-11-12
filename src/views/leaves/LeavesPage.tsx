import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Check,
  X,
  Plus,
  Trash2,
  Umbrella,
  CalendarClock,
} from 'lucide-react';
import type { LeaveBalance, LeaveRequest, LeaveType } from '@/types';
import { useQuery } from '@/hooks/useQuery';
import { useSession } from '@/hooks/useSession';
import { useNotifications } from '@/hooks/useNotifications';
import { LeaveService } from '@/services/LeaveService';
import { ReferenceService } from '@/services/ReferenceService';
import { PageHeading, Panel, QueryState, Tabs } from '@/components/ui/Page';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { can } from '@/utils/permissions';
import { formatDate, initials } from '@/utils/formatDate';

const LEAVE_TYPES: LeaveType[] = [
  'Paid Leave',
  'Sick Leave',
  'Casual Leave',
  'Privilege Leave',
  'Comp Off',
  'Unpaid Leave',
];

function computeBusinessDays(start: string, end: string): number {
  if (!start || !end) return 1;
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e < s) return 1;
  let days = 0;
  const cur = new Date(s);
  while (cur <= e) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) days += 1;
    cur.setDate(cur.getDate() + 1);
  }
  return Math.max(1, days);
}

function availableForType(bal: LeaveBalance | undefined, type: LeaveType): number | null {
  if (!bal) return null;
  switch (type) {
    case 'Paid Leave':
      return Math.max(0, bal.paidTotal - bal.paidUsed);
    case 'Sick Leave':
      return Math.max(0, bal.sickTotal - bal.sickUsed);
    case 'Casual Leave':
      return Math.max(0, bal.casualTotal - bal.casualUsed);
    case 'Privilege Leave':
      return Math.max(0, bal.privilegeTotal - bal.privilegeUsed);
    case 'Comp Off':
      return Math.max(0, bal.compOff);
    case 'Unpaid Leave':
      return null;
  }
}

export default function LeavesPage() {
  const { user, permissions } = useSession();
  const { toast } = useNotifications();
  const canManage =
    can(permissions, 'employees', 'manage') || can(permissions, 'payroll', 'manage');

  const today = new Date().toISOString().slice(0, 10);

  const [tab, setTab] = useState('Leave Requests');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [busy, setBusy] = useState(false);

  const [applyOpen, setApplyOpen] = useState(false);
  const [form, setForm] = useState({
    employeeId: user?.id || '',
    leaveType: 'Paid Leave' as LeaveType,
    startDate: today,
    endDate: today,
    days: '1',
    reason: '',
  });

  const [rejectTarget, setRejectTarget] = useState<LeaveRequest | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');

  const query = useQuery(async () => {
    const [leaveData, refs] = await Promise.all([
      LeaveService.list({
        employeeId: canManage ? employeeFilter || undefined : user?.id,
        status: statusFilter || undefined,
      }),
      ReferenceService.list(),
    ]);
    return { ...leaveData, refs };
  }, `${employeeFilter}:${statusFilter}:${canManage}:${user?.id}`);

  const d = query.data;
  const empMap = Object.fromEntries((d?.refs.employees || []).map((e) => [e.id, e]));
  const balMap = Object.fromEntries((d?.balances || []).map((b) => [b.employeeId, b]));
  const myBalance = user?.id ? balMap[user.id] : undefined;

  const filteredRequests = (d?.requests || []).filter((r) => {
    if (typeFilter && r.leaveType !== typeFilter) return false;
    if (!search.trim()) return true;
    const emp = empMap[r.employeeId];
    const q = search.toLowerCase();
    return (
      (emp?.name || '').toLowerCase().includes(q) ||
      (emp?.employeeId || '').toLowerCase().includes(q) ||
      r.reason.toLowerCase().includes(q) ||
      r.leaveType.toLowerCase().includes(q)
    );
  });

  const balanceRows = (d?.balances || [])
    .filter((b) => (canManage ? true : b.employeeId === user?.id))
    .filter((b) => {
      if (!search.trim()) return true;
      const emp = empMap[b.employeeId];
      const q = search.toLowerCase();
      return (
        (emp?.name || '').toLowerCase().includes(q) ||
        (emp?.employeeId || '').toLowerCase().includes(q)
      );
    })
    .map((b) => ({ ...b, id: b.employeeId }));

  const selectedBalance = balMap[form.employeeId || user?.id || ''];
  const selectedAvailable = availableForType(selectedBalance, form.leaveType);

  const handleDateChange = (field: 'startDate' | 'endDate', val: string) => {
    const nextStart = field === 'startDate' ? val : form.startDate;
    const nextEnd = field === 'endDate' ? val : form.endDate;
    const days = computeBusinessDays(nextStart, nextEnd);
    setForm((f) => ({
      ...f,
      [field]: val,
      ...(field === 'startDate' && nextEnd < val ? { endDate: val } : {}),
      days: String(days),
    }));
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmp = form.employeeId || user?.id;
    if (!targetEmp) return;
    if (!form.reason.trim()) {
      toast('Please enter a reason for the leave request', 'error');
      return;
    }
    setBusy(true);
    try {
      await LeaveService.apply({
        employeeId: targetEmp,
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate < form.startDate ? form.startDate : form.endDate,
        days: Math.max(0.5, Number(form.days) || 1),
        reason: form.reason.trim(),
      });
      toast('Leave request submitted');
      setApplyOpen(false);
      setForm({
        employeeId: user?.id || '',
        leaveType: 'Paid Leave',
        startDate: today,
        endDate: today,
        days: '1',
        reason: '',
      });
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleReview = async (
    req: LeaveRequest,
    status: 'Approved' | 'Rejected',
    notes?: string
  ) => {
    if (!user?.id) return;
    setBusy(true);
    try {
      await LeaveService.review(req.id, status, user.id, notes);
      toast(`Leave ${status.toLowerCase()}`);
      setRejectTarget(null);
      setRejectNotes('');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    setBusy(true);
    try {
      await LeaveService.remove(id);
      toast('Leave request withdrawn');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const myTotalPaidLeft = myBalance
    ? Math.max(0, myBalance.paidTotal - myBalance.paidUsed) +
      Math.max(0, myBalance.sickTotal - myBalance.sickUsed) +
      Math.max(0, myBalance.casualTotal - myBalance.casualUsed) +
      Math.max(0, myBalance.privilegeTotal - myBalance.privilegeUsed) +
      myBalance.compOff
    : 0;

  return (
    <>
      <PageHeading
        title="Leaves"
        actions={
          <Button
            onClick={() => {
              setForm((f) => ({ ...f, employeeId: user?.id || '' }));
              setApplyOpen(true);
            }}
          >
            <Plus size={16} /> Apply Leave
          </Button>
        }
      />

      <QueryState query={query}>
        {d && (
          <>
            {/* Personal Paid & LOP Leave Balance Cards */}
            {myBalance && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Umbrella className="w-3.5 h-3.5 text-[#107C41]" />
                    My {myBalance.year} Leave Quota
                  </span>
                  <span className="text-xs font-semibold text-[#107C41] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    {myTotalPaidLeft} Paid Days Available
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        Paid Leave
                      </span>
                      <span className="text-[11px] font-medium text-[#107C41] bg-emerald-50/90 px-2 py-0.5 rounded-full">
                        Paid
                      </span>
                    </div>
                    <p className="text-2xl font-semibold tabular-nums text-zinc-900 mt-2">
                      {Math.max(0, myBalance.paidTotal - myBalance.paidUsed)}
                      <span className="text-xs font-normal text-slate-400">
                        {' '}
                        / {myBalance.paidTotal}
                      </span>
                    </p>
                  </div>

                  <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        Sick Leave
                      </span>
                      <span className="text-[11px] font-medium text-[#107C41] bg-emerald-50/90 px-2 py-0.5 rounded-full">
                        Paid
                      </span>
                    </div>
                    <p className="text-2xl font-semibold tabular-nums text-zinc-900 mt-2">
                      {Math.max(0, myBalance.sickTotal - myBalance.sickUsed)}
                      <span className="text-xs font-normal text-slate-400">
                        {' '}
                        / {myBalance.sickTotal}
                      </span>
                    </p>
                  </div>

                  <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        Casual
                      </span>
                      <span className="text-[11px] font-medium text-[#107C41] bg-emerald-50/90 px-2 py-0.5 rounded-full">
                        Paid
                      </span>
                    </div>
                    <p className="text-2xl font-semibold tabular-nums text-zinc-900 mt-2">
                      {Math.max(0, myBalance.casualTotal - myBalance.casualUsed)}
                      <span className="text-xs font-normal text-slate-400">
                        {' '}
                        / {myBalance.casualTotal}
                      </span>
                    </p>
                  </div>

                  <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        Privilege
                      </span>
                      <span className="text-[11px] font-medium text-[#107C41] bg-emerald-50/90 px-2 py-0.5 rounded-full">
                        Paid
                      </span>
                    </div>
                    <p className="text-2xl font-semibold tabular-nums text-zinc-900 mt-2">
                      {Math.max(0, myBalance.privilegeTotal - myBalance.privilegeUsed)}
                      <span className="text-xs font-normal text-slate-400">
                        {' '}
                        / {myBalance.privilegeTotal}
                      </span>
                    </p>
                  </div>

                  <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        Comp Off
                      </span>
                      <span className="text-[11px] font-medium text-[#107C41] bg-emerald-50/90 px-2 py-0.5 rounded-full">
                        Paid
                      </span>
                    </div>
                    <p className="text-2xl font-semibold tabular-nums text-[#107C41] mt-2">
                      {myBalance.compOff}
                      <span className="text-xs font-normal text-slate-400"> days</span>
                    </p>
                  </div>

                  <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        Unpaid LOP
                      </span>
                      <span className="text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                        LOP
                      </span>
                    </div>
                    <p className="text-2xl font-semibold tabular-nums text-rose-600 mt-2">
                      {myBalance.unpaidTaken}
                      <span className="text-xs font-normal text-slate-400"> taken</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Tabs
              tabs={['Leave Requests', 'Team Balances', 'Holiday Calendar']}
              active={tab}
              onChange={setTab}
            />

            {tab === 'Leave Requests' && (
              <Panel>
                <div className="filters">
                  <Input
                    label="Search"
                    placeholder="Employee name, code, or reason…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Select
                    label="Leave Type"
                    placeholder="All types"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    options={LEAVE_TYPES.map((t) => ({ value: t, label: t }))}
                  />
                  <Select
                    label="Status"
                    placeholder="All statuses"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                      { value: 'Pending', label: 'Pending' },
                      { value: 'Approved', label: 'Approved' },
                      { value: 'Rejected', label: 'Rejected' },
                      { value: 'Cancelled', label: 'Cancelled' },
                    ]}
                  />
                  {canManage && (
                    <Select
                      label="Employee"
                      placeholder="All employees"
                      value={employeeFilter}
                      onChange={(e) => setEmployeeFilter(e.target.value)}
                      options={d.refs.employees.map((e) => ({
                        value: e.id,
                        label: `${e.name} (${e.employeeId})`,
                      }))}
                    />
                  )}
                </div>

                <Table<LeaveRequest>
                  caption="Leave requests"
                  rows={filteredRequests}
                  columns={[
                    {
                      key: 'employee',
                      title: 'Employee',
                      render: (r) => {
                        const emp = empMap[r.employeeId];
                        return (
                          <Link
                            to={`/employees/${r.employeeId}?tab=Leaves+%26+Balance`}
                            className="inline-flex items-center gap-2.5 font-semibold text-gray-900 hover:text-[#107C41]"
                          >
                            <span className="w-7 h-7 rounded-full bg-emerald-50 text-[#107C41] text-[11px] font-bold flex items-center justify-center border border-emerald-200 shrink-0">
                              {initials(emp?.name)}
                            </span>
                            <span>
                              {emp?.name || r.employeeId}
                              <small className="block text-[11px] font-normal text-gray-400">
                                {emp?.employeeId}
                              </small>
                            </span>
                          </Link>
                        );
                      },
                    },
                    {
                      key: 'type',
                      title: 'Type & Pay',
                      render: (r) => (
                        <div className="flex flex-col gap-1 items-start">
                          <Badge>{r.leaveType}</Badge>
                          <span
                            className={`text-[11px] font-semibold ${
                              r.isPaid ? 'text-[#107C41]' : 'text-rose-600'
                            }`}
                          >
                            {r.isPaid ? 'Paid Leave' : 'Unpaid (LOP)'}
                          </span>
                        </div>
                      ),
                    },
                    {
                      key: 'dates',
                      title: 'Dates',
                      render: (r) => (
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatDate(r.startDate)}
                            {r.endDate !== r.startDate ? ` → ${formatDate(r.endDate)}` : ''}
                          </div>
                          <small className="text-xs text-gray-500">
                            {r.days} {r.days === 1 ? 'day' : 'days'}
                          </small>
                        </div>
                      ),
                    },
                    {
                      key: 'reason',
                      title: 'Reason',
                      render: (r) => (
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-800">{r.reason}</p>
                          {r.reviewerNotes && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              Note: {r.reviewerNotes}
                            </p>
                          )}
                        </div>
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
                          {canManage && r.status === 'Pending' && (
                            <>
                              <Button
                                disabled={busy}
                                onClick={() => handleReview(r, 'Approved')}
                                title="Approve leave"
                              >
                                <Check size={14} /> Approve
                              </Button>
                              <Button
                                variant="outline"
                                disabled={busy}
                                onClick={() => {
                                  setRejectTarget(r);
                                  setRejectNotes('');
                                }}
                                title="Reject leave"
                              >
                                <X size={14} /> Reject
                              </Button>
                            </>
                          )}
                          {(r.employeeId === user?.id || canManage) &&
                            r.status === 'Pending' && (
                              <Button
                                variant="ghost"
                                disabled={busy}
                                onClick={() => handleDelete(r.id)}
                                title="Withdraw request"
                              >
                                <Trash2 size={14} />
                              </Button>
                            )}
                          {r.status !== 'Pending' && (
                            <span className="text-xs text-gray-400">
                              {r.reviewedById
                                ? empMap[r.reviewedById]?.name || 'Reviewed'
                                : 'Closed'}
                            </span>
                          )}
                        </div>
                      ),
                    },
                  ]}
                />
              </Panel>
            )}

            {tab === 'Team Balances' && (
              <Panel>
                <div className="filters">
                  <Input
                    label="Search employee"
                    placeholder="Filter by employee name or code…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Table<LeaveBalance & { id: string }>
                  caption="Employee leave balances"
                  rows={balanceRows}
                  columns={[
                    {
                      key: 'employee',
                      title: 'Employee',
                      render: (b) => {
                        const emp = empMap[b.employeeId];
                        return (
                          <Link
                            to={`/employees/${b.employeeId}?tab=Leaves+%26+Balance`}
                            className="font-semibold text-gray-900 hover:text-[#107C41]"
                          >
                            {emp?.name || b.employeeId}
                            <small className="block text-xs font-normal text-gray-400">
                              {emp?.designation}
                            </small>
                          </Link>
                        );
                      },
                    },
                    {
                      key: 'paid',
                      title: 'Paid Leave',
                      render: (b) => (
                        <span className="font-semibold text-gray-900">
                          {Math.max(0, b.paidTotal - b.paidUsed)}{' '}
                          <span className="text-gray-400 font-normal">/ {b.paidTotal}</span>
                        </span>
                      ),
                    },
                    {
                      key: 'sick',
                      title: 'Sick Leave',
                      render: (b) => (
                        <span>
                          {Math.max(0, b.sickTotal - b.sickUsed)}{' '}
                          <span className="text-gray-400">/ {b.sickTotal}</span>
                        </span>
                      ),
                    },
                    {
                      key: 'casual',
                      title: 'Casual Leave',
                      render: (b) => (
                        <span>
                          {Math.max(0, b.casualTotal - b.casualUsed)}{' '}
                          <span className="text-gray-400">/ {b.casualTotal}</span>
                        </span>
                      ),
                    },
                    {
                      key: 'privilege',
                      title: 'Privilege Leave',
                      render: (b) => (
                        <span>
                          {Math.max(0, b.privilegeTotal - b.privilegeUsed)}{' '}
                          <span className="text-gray-400">/ {b.privilegeTotal}</span>
                        </span>
                      ),
                    },
                    {
                      key: 'compOff',
                      title: 'Comp Off',
                      render: (b) => (
                        <span className="font-semibold text-[#107C41]">{b.compOff}</span>
                      ),
                    },
                    {
                      key: 'unpaid',
                      title: 'Unpaid LOP Taken',
                      render: (b) => (
                        <span
                          className={
                            b.unpaidTaken > 0
                              ? 'font-bold text-rose-600'
                              : 'text-gray-400'
                          }
                        >
                          {b.unpaidTaken}d
                        </span>
                      ),
                    },
                  ]}
                />
              </Panel>
            )}

            {tab === 'Holiday Calendar' && (
              <Panel title={`${new Date().getFullYear()} Holidays`}>
                <div className="panel-body">
                  {d.holidays.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {d.holidays.map((h) => {
                        const dt = new Date(h.date);
                        const dayName = Number.isNaN(dt.getTime())
                          ? ''
                          : dt.toLocaleDateString('en-IN', { weekday: 'long' });
                        return (
                          <div
                            key={h.id}
                            className="p-4 rounded-2xl border border-gray-200/80 bg-gray-50/60 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-[#107C41] flex items-center justify-center shrink-0">
                                <CalendarClock className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm">{h.name}</p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(h.date)}
                                  {dayName ? ` · ${dayName}` : ''}
                                </p>
                              </div>
                            </div>
                            <Badge>{h.type}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState
                      title="No holidays configured"
                      description="Organization holidays will appear here."
                    />
                  )}
                </div>
              </Panel>
            )}
          </>
        )}
      </QueryState>

      {/* Apply Leave Modal */}
      {applyOpen && (
        <Modal title="Apply for Leave" onClose={() => setApplyOpen(false)} busy={busy}>
          <form onSubmit={handleApply}>
            <div className="modal-body">
              <div className="form-grid">
                {canManage && d?.refs.employees && (
                  <Select
                    label="Employee"
                    value={form.employeeId}
                    onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
                    options={d.refs.employees.map((emp) => ({
                      value: emp.id,
                      label: `${emp.name} (${emp.employeeId})`,
                    }))}
                  />
                )}
                <Select
                  label="Leave Type"
                  value={form.leaveType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, leaveType: e.target.value as LeaveType }))
                  }
                  options={LEAVE_TYPES.map((t) => ({ value: t, label: t }))}
                />
                <Input
                  label="Start Date"
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                />
                <Input
                  label="End Date"
                  type="date"
                  required
                  min={form.startDate}
                  value={form.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                />
                <Input
                  label="Working Days"
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={form.days}
                  onChange={(e) => setForm((f) => ({ ...f, days: e.target.value }))}
                />
              </div>

              <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-200/80 text-xs flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-[#107C41]" />
                  {form.leaveType === 'Unpaid Leave'
                    ? 'Loss of Pay (deducted in monthly salary slip)'
                    : `${form.leaveType} Balance Remaining:`}
                </span>
                <strong
                  className={
                    form.leaveType === 'Unpaid Leave'
                      ? 'text-rose-600'
                      : (selectedAvailable ?? 0) >= Number(form.days || 1)
                        ? 'text-[#107C41]'
                        : 'text-amber-600'
                  }
                >
                  {form.leaveType === 'Unpaid Leave'
                    ? 'Unpaid'
                    : `${selectedAvailable ?? 0} days`}
                </strong>
              </div>

              <label className="field mt-4">
                <span>Reason</span>
                <textarea
                  rows={3}
                  required
                  placeholder="Brief note for manager approval…"
                  value={form.reason}
                  onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                />
              </label>
            </div>
            <div className="modal-footer">
              <Button variant="ghost" onClick={() => setApplyOpen(false)} disabled={busy}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                Submit Request
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reject Reason Modal */}
      {rejectTarget && (
        <Modal title="Reject Leave Request" onClose={() => setRejectTarget(null)} busy={busy}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleReview(rejectTarget, 'Rejected', rejectNotes.trim() || undefined);
            }}
          >
            <div className="modal-body">
              <p className="text-sm text-gray-600 mb-3">
                Rejecting <strong>{rejectTarget.days}d {rejectTarget.leaveType}</strong> for{' '}
                <strong>{empMap[rejectTarget.employeeId]?.name}</strong>.
              </p>
              <label className="field">
                <span>Reviewer Note</span>
                <textarea
                  rows={3}
                  placeholder="Optional reason shown to employee…"
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                />
              </label>
            </div>
            <div className="modal-footer">
              <Button variant="ghost" onClick={() => setRejectTarget(null)} disabled={busy}>
                Cancel
              </Button>
              <Button variant="destructive" type="submit" disabled={busy}>
                Confirm Reject
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

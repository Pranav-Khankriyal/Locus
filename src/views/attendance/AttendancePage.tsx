import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, LogIn, LogOut, CalendarCheck, Laptop, MapPin, Plus } from 'lucide-react';
import type { AttendanceRecord, AttendanceStatus, WorkMode } from '@/types';
import { useQuery } from '@/hooks/useQuery';
import { useSession } from '@/hooks/useSession';
import { useNotifications } from '@/hooks/useNotifications';
import { AttendanceService } from '@/services/AttendanceService';
import { ReferenceService } from '@/services/ReferenceService';
import { PageHeading, Panel, QueryState } from '@/components/ui/Page';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { can } from '@/utils/permissions';
import { formatDate, initials } from '@/utils/formatDate';

export default function AttendancePage() {
  const { user, permissions } = useSession();
  const { toast } = useNotifications();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [workMode, setWorkMode] = useState<WorkMode>('Office');
  const [busy, setBusy] = useState(false);
  const [markModal, setMarkModal] = useState(false);

  const [markForm, setMarkForm] = useState({
    employeeId: user?.id || '',
    date: new Date().toISOString().slice(0, 10),
    status: 'Present' as AttendanceStatus,
    workMode: 'Office' as WorkMode,
    checkIn: '09:15',
    checkOut: '18:15',
    notes: '',
  });

  const canManageAll = can(permissions, 'employees', 'manage');
  const todayStr = new Date().toISOString().slice(0, 10);

  const query = useQuery(async () => {
    const [records, refs] = await Promise.all([
      AttendanceService.list({
        employeeId: canManageAll ? employeeFilter || undefined : user?.id,
        status: statusFilter || undefined,
        month: monthFilter || undefined,
      }),
      ReferenceService.list(),
    ]);
    return { records, refs };
  }, `${employeeFilter}:${statusFilter}:${monthFilter}:${canManageAll}`);

  const d = query.data;
  const empMap = Object.fromEntries((d?.refs.employees || []).map((e) => [e.id, e]));

  const myTodayRecord = d?.records.find(
    (r) => r.employeeId === user?.id && r.date === todayStr
  );

  const filteredRecords = (d?.records || []).filter((r) => {
    if (!search.trim()) return true;
    const emp = empMap[r.employeeId];
    const q = search.toLowerCase();
    return (
      (emp?.name || '').toLowerCase().includes(q) ||
      (emp?.employeeId || '').toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q) ||
      r.notes.toLowerCase().includes(q)
    );
  });

  // Compute crisp stats
  const presentCount = filteredRecords.filter((r) => r.status === 'Present').length;
  const wfhCount = filteredRecords.filter((r) => r.status === 'WFH').length;
  const lateCount = filteredRecords.filter((r) => r.status === 'Late').length;
  const leaveCount = filteredRecords.filter((r) => r.status === 'On Leave').length;
  const withHours = filteredRecords.filter((r) => r.workHours > 0);
  const avgHours = withHours.length
    ? (withHours.reduce((sum, r) => sum + r.workHours, 0) / withHours.length).toFixed(1)
    : '0.0';

  const handleClockIn = async () => {
    if (!user?.id) return;
    setBusy(true);
    try {
      await AttendanceService.clockIn(user.id, workMode);
      toast(`Checked in (${workMode})`);
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleClockOut = async () => {
    if (!user?.id) return;
    setBusy(true);
    try {
      await AttendanceService.clockOut(user.id);
      toast('Checked out for today');
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleMarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await AttendanceService.mark({
        employeeId: markForm.employeeId || user?.id || 'e-1',
        date: markForm.date,
        status: markForm.status,
        workMode: markForm.workMode,
        checkIn: markForm.status === 'Absent' || markForm.status === 'On Leave' ? null : markForm.checkIn,
        checkOut: markForm.status === 'Absent' || markForm.status === 'On Leave' ? null : markForm.checkOut,
        notes: markForm.notes,
      });
      toast('Attendance record saved');
      setMarkModal(false);
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeading
        title="Attendance"
        actions={
          canManageAll ? (
            <Button
              onClick={() => {
                setMarkForm((f) => ({ ...f, employeeId: user?.id || d?.refs.employees[0]?.id || 'e-1' }));
                setMarkModal(true);
              }}
            >
              <Plus size={16} /> Mark Attendance
            </Button>
          ) : undefined
        }
      />

      {/* Live Daily Check-in Console */}
      <div className="bg-white rounded-[1.5rem] p-5 border border-gray-200/80 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F7547] to-[#0A5734] text-white flex items-center justify-center shadow-sm shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-gray-900">
                Today · {formatDate(todayStr)}
              </h2>
              {myTodayRecord && <Badge>{myTodayRecord.status}</Badge>}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                In: <strong className="text-gray-800">{myTodayRecord?.checkIn || 'Not punched in'}</strong>
              </span>
              <span className="inline-flex items-center gap-1">
                <LogOut className="w-3.5 h-3.5 text-amber-600" />
                Out: <strong className="text-gray-800">{myTodayRecord?.checkOut || 'Active shift'}</strong>
              </span>
              {myTodayRecord && myTodayRecord.workHours > 0 && (
                <span className="font-semibold text-[#107C41]">
                  {myTodayRecord.workHours} hrs logged
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {!myTodayRecord?.checkIn && (
            <>
              <div className="bg-gray-100 rounded-full p-1 flex items-center text-xs">
                {(['Office', 'Remote', 'Hybrid'] as WorkMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setWorkMode(m)}
                    className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                      workMode === m ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <Button disabled={busy} onClick={handleClockIn}>
                <LogIn size={16} /> Check In
              </Button>
            </>
          )}
          {myTodayRecord?.checkIn && !myTodayRecord?.checkOut && (
            <Button variant="outline" disabled={busy} onClick={handleClockOut}>
              <LogOut size={16} /> Check Out
            </Button>
          )}
          {myTodayRecord?.checkIn && myTodayRecord?.checkOut && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#107C41] bg-emerald-50 px-3.5 py-2 rounded-full border border-emerald-200">
              <CalendarCheck className="w-4 h-4" /> Shift completed ({myTodayRecord.workHours}h)
            </span>
          )}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <span className="text-xs font-medium text-slate-500">Present Logs</span>
          <p className="text-2xl font-semibold tabular-nums text-zinc-900 mt-1.5">{presentCount}</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <span className="text-xs font-medium text-slate-500">Remote / WFH</span>
          <p className="text-2xl font-semibold tabular-nums text-[#107C41] mt-1.5">{wfhCount}</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <span className="text-xs font-medium text-slate-500">Late Arrivals</span>
          <p className="text-2xl font-semibold tabular-nums text-amber-600 mt-1.5">{lateCount}</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <span className="text-xs font-medium text-slate-500">On Approved Leave</span>
          <p className="text-2xl font-semibold tabular-nums text-slate-700 mt-1.5">{leaveCount}</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <span className="text-xs font-medium text-slate-500">Avg Shift Duration</span>
          <p className="text-2xl font-semibold tabular-nums text-zinc-900 mt-1.5">{avgHours}h</p>
        </div>
      </div>

      {/* Attendance Ledger Table */}
      <Panel>
        <div className="filters">
          <Input
            label="Search attendance"
            placeholder="Name, code, location, notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {canManageAll && (
            <Select
              label="Employee"
              placeholder="All employees"
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              options={(d?.refs.employees || []).map((e) => ({ value: e.id, label: e.name }))}
            />
          )}
          <Select
            label="Status"
            placeholder="All statuses"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={['Present', 'WFH', 'Late', 'Half Day', 'On Leave', 'Absent'].map((s) => ({
              value: s,
              label: s,
            }))}
          />
          <Input
            label="Month"
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          />
          <div className="filter-actions">
            <Button
              variant="ghost"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setMonthFilter('');
                setEmployeeFilter('');
              }}
            >
              Clear filters
            </Button>
          </div>
        </div>

        <QueryState query={query}>
          <Table<AttendanceRecord>
            caption="Attendance logs"
            rows={filteredRecords}
            columns={[
              {
                key: 'date',
                title: 'Date',
                render: (r) => <span className="font-semibold text-gray-900">{formatDate(r.date)}</span>,
              },
              {
                key: 'employee',
                title: 'Employee',
                render: (r) => {
                  const emp = empMap[r.employeeId];
                  return (
                    <Link to={`/employees/${r.employeeId}`} className="person-cell">
                      <span className="avatar small">{initials(emp?.name || r.employeeId)}</span>
                      <div>
                        <strong>{emp?.name || r.employeeId}</strong>
                        <small>{emp?.employeeId || ''}</small>
                      </div>
                    </Link>
                  );
                },
              },
              { key: 'status', title: 'Status', render: (r) => <Badge>{r.status}</Badge> },
              {
                key: 'checkIn',
                title: 'Check In',
                render: (r) => <span className="mono">{r.checkIn || '—'}</span>,
              },
              {
                key: 'checkOut',
                title: 'Check Out',
                render: (r) => <span className="mono">{r.checkOut || '—'}</span>,
              },
              {
                key: 'hours',
                title: 'Work Hours',
                render: (r) => (r.workHours ? <strong>{r.workHours} hrs</strong> : '—'),
              },
              {
                key: 'mode',
                title: 'Mode & Location',
                render: (r) => (
                  <div className="text-xs">
                    <span className="inline-flex items-center gap-1 font-semibold text-gray-700">
                      {r.workMode === 'Remote' ? <Laptop size={12} /> : <MapPin size={12} />}
                      {r.workMode}
                    </span>
                    <span className="block text-[10px] text-gray-400">{r.location}</span>
                  </div>
                ),
              },
              {
                key: 'notes',
                title: 'Notes',
                render: (r) => <span className="text-xs text-gray-500">{r.notes || '—'}</span>,
              },
            ]}
          />
        </QueryState>
      </Panel>

      {/* Regularize / Mark Attendance Modal */}
      {markModal && (
        <Modal title="Mark or Regularize Attendance" onClose={() => setMarkModal(false)}>
          <form onSubmit={handleMarkSubmit}>
            <div className="modal-body space-y-4">
              <div className="form-grid">
                <Select
                  label="Employee"
                  value={markForm.employeeId}
                  onChange={(e) => setMarkForm({ ...markForm, employeeId: e.target.value })}
                  options={(d?.refs.employees || []).map((e) => ({ value: e.id, label: e.name }))}
                />
                <Input
                  label="Date"
                  type="date"
                  required
                  value={markForm.date}
                  onChange={(e) => setMarkForm({ ...markForm, date: e.target.value })}
                />
                <Select
                  label="Status"
                  value={markForm.status}
                  onChange={(e) => setMarkForm({ ...markForm, status: e.target.value as AttendanceStatus })}
                  options={['Present', 'WFH', 'Late', 'Half Day', 'On Leave', 'Absent'].map((s) => ({
                    value: s,
                    label: s,
                  }))}
                />
                <Select
                  label="Work Mode"
                  value={markForm.workMode}
                  onChange={(e) => setMarkForm({ ...markForm, workMode: e.target.value as WorkMode })}
                  options={['Office', 'Remote', 'Hybrid'].map((s) => ({ value: s, label: s }))}
                />
                <Input
                  label="Check In (HH:mm)"
                  type="time"
                  value={markForm.checkIn}
                  onChange={(e) => setMarkForm({ ...markForm, checkIn: e.target.value })}
                />
                <Input
                  label="Check Out (HH:mm)"
                  type="time"
                  value={markForm.checkOut}
                  onChange={(e) => setMarkForm({ ...markForm, checkOut: e.target.value })}
                />
              </div>
              <Input
                label="Notes / Regularization Reason"
                placeholder="Optional context…"
                value={markForm.notes}
                onChange={(e) => setMarkForm({ ...markForm, notes: e.target.value })}
              />
            </div>
            <div className="modal-footer">
              <Button variant="ghost" onClick={() => setMarkModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                Save Attendance
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}


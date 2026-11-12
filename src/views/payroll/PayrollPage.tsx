import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  IndianRupee,
  Gift,
  PiggyBank,
  FileSpreadsheet,
  Eye,
  CheckCircle2,
  Play,
  Plus,
  Edit3,
  BookOpen,
} from 'lucide-react';
import type {
  BonusRecord,
  BonusStatus,
  BonusType,
  PFAccount,
  PFTransaction,
  SalarySlip,
  SalaryStructure,
} from '@/types';
import { useQuery } from '@/hooks/useQuery';
import { useSession } from '@/hooks/useSession';
import { useNotifications } from '@/hooks/useNotifications';
import { PayrollService } from '@/services/PayrollService';
import { ReferenceService } from '@/services/ReferenceService';
import { SalarySlipModal } from '@/components/payroll/SalarySlipModal';
import { PageHeading, Panel, QueryState, Tabs } from '@/components/ui/Page';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { can } from '@/utils/permissions';
import { formatCurrency, formatMonthLabel } from '@/utils/formatCurrency';
import { formatDate, initials } from '@/utils/formatDate';

const PAYROLL_TABS = [
  'Salary Slips',
  'Bonuses',
  'PF Fund (EPF)',
  'Salary Structures',
];

const BONUS_TYPES: BonusType[] = [
  'Performance Bonus',
  'Annual Appraisal',
  'Joining Bonus',
  'Spot Award',
  'Referral Bonus',
  'Festival Bonus',
];

export default function PayrollPage() {
  const { user, organisation, permissions } = useSession();
  const { toast } = useNotifications();
  const [params, setParams] = useSearchParams();
  const tab = PAYROLL_TABS.includes(params.get('tab') || '')
    ? params.get('tab')!
    : 'Salary Slips';

  const canManage =
    can(permissions, 'payroll', 'manage') || can(permissions, 'employees', 'manage');

  const currentMonth = new Date().toISOString().slice(0, 7);

  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [bonusStatusFilter, setBonusStatusFilter] = useState('');
  const [busy, setBusy] = useState(false);

  // Active modals
  const [activeSlip, setActiveSlip] = useState<SalarySlip | null>(null);
  const [runModalOpen, setRunModalOpen] = useState(false);
  const [runMonth, setRunMonth] = useState(currentMonth);

  const [bonusModalOpen, setBonusModalOpen] = useState(false);
  const [bonusForm, setBonusForm] = useState({
    employeeId: '',
    bonusType: 'Performance Bonus' as BonusType,
    amount: '25000',
    payoutMonth: currentMonth,
    reason: '',
    status: 'Approved' as BonusStatus,
  });

  const [editStructure, setEditStructure] = useState<SalaryStructure | null>(null);
  const [structForm, setStructForm] = useState({
    annualCtc: 0,
    basicMonthly: 0,
    hraMonthly: 0,
    specialAllowanceMonthly: 0,
    conveyanceMonthly: 0,
    employeePfMonthly: 0,
    employerPfMonthly: 0,
    professionalTaxMonthly: 200,
    tdsMonthly: 0,
    bankName: '',
    bankAccountLast4: '',
    panNumber: '',
  });

  const [activePF, setActivePF] = useState<PFAccount | null>(null);
  const [pfSettings, setPfSettings] = useState({
    vpfMonthly: '0',
    nomineeName: '',
    kycStatus: 'Verified' as 'Verified' | 'Pending',
  });
  const [pfTxnForm, setPfTxnForm] = useState({
    type: 'VPF' as PFTransaction['type'],
    month: currentMonth,
    employeeContribution: '5000',
    employerContribution: '0',
  });

  const query = useQuery(async () => {
    const [payroll, refs] = await Promise.all([
      PayrollService.list({
        employeeId: canManage ? employeeFilter || undefined : user?.id,
        month: monthFilter || undefined,
      }),
      ReferenceService.list(),
    ]);
    return { ...payroll, refs };
  }, `${employeeFilter}:${monthFilter}:${canManage}:${user?.id}`);

  const d = query.data;
  const empMap = Object.fromEntries((d?.refs.employees || []).map((e) => [e.id, e]));
  const structMap = Object.fromEntries((d?.structures || []).map((s) => [s.employeeId, s]));
  const pfMap = Object.fromEntries((d?.pfAccounts || []).map((a) => [a.employeeId, a]));

  const matchSearch = (empId: string, extra = '') => {
    if (!search.trim()) return true;
    const emp = empMap[empId];
    const q = search.toLowerCase();
    return (
      (emp?.name || '').toLowerCase().includes(q) ||
      (emp?.employeeId || '').toLowerCase().includes(q) ||
      extra.toLowerCase().includes(q)
    );
  };

  const filteredSlips = (d?.slips || []).filter((s) =>
    matchSearch(s.employeeId, `${s.slipNumber} ${s.monthLabel} ${s.status}`)
  );
  const filteredBonuses = (d?.bonuses || []).filter((b) => {
    if (bonusStatusFilter && b.status !== bonusStatusFilter) return false;
    return matchSearch(b.employeeId, `${b.bonusType} ${b.reason}`);
  });
  const filteredPF = (d?.pfAccounts || []).filter((a) =>
    matchSearch(a.employeeId, `${a.uan} ${a.pfAccountNumber} ${a.nomineeName}`)
  );
  const filteredStructures = (d?.structures || []).filter((s) =>
    matchSearch(s.employeeId, `${s.bankName} ${s.panNumber}`)
  );

  // KPI metrics
  const latestMonth = d?.slips[0]?.month || currentMonth;
  const latestSlips = (d?.slips || []).filter((s) => s.month === latestMonth);
  const latestNetTotal = latestSlips.reduce((sum, s) => sum + s.netPay, 0);
  const bonusPoolTotal = (d?.bonuses || [])
    .filter((b) => b.status === 'Approved' || b.status === 'Credited')
    .reduce((sum, b) => sum + b.amount, 0);
  const pfTotalCorpus = (d?.pfAccounts || []).reduce((sum, a) => sum + a.totalBalance, 0);
  const annualCtcTotal = (d?.structures || []).reduce((sum, s) => sum + s.annualCtc, 0);

  const handleRunPayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const created = await PayrollService.generateSlips(runMonth);
      toast(`Generated payroll for ${formatMonthLabel(runMonth)} (${created.length} slips)`);
      setRunModalOpen(false);
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleMarkPaid = async (slipId: string) => {
    setBusy(true);
    try {
      const updated = await PayrollService.markSlipPaid(slipId);
      setActiveSlip(updated);
      toast('Salary slip marked Paid and PF contribution posted');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleAwardBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmp = bonusForm.employeeId || d?.refs.employees[0]?.id;
    if (!targetEmp) return;
    setBusy(true);
    try {
      await PayrollService.createBonus({
        employeeId: targetEmp,
        bonusType: bonusForm.bonusType,
        amount: Math.max(0, Number(bonusForm.amount) || 0),
        payoutMonth: bonusForm.payoutMonth,
        reason: bonusForm.reason.trim() || bonusForm.bonusType,
        status: bonusForm.status,
      });
      toast('Bonus record added');
      setBonusModalOpen(false);
      setBonusForm((f) => ({ ...f, reason: '' }));
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleBonusStatus = async (id: string, status: BonusStatus) => {
    setBusy(true);
    try {
      await PayrollService.updateBonusStatus(id, status);
      toast(`Bonus marked ${status}`);
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const openStructureEdit = (s: SalaryStructure) => {
    setEditStructure(s);
    setStructForm({
      annualCtc: s.annualCtc,
      basicMonthly: s.basicMonthly,
      hraMonthly: s.hraMonthly,
      specialAllowanceMonthly: s.specialAllowanceMonthly,
      conveyanceMonthly: s.conveyanceMonthly,
      employeePfMonthly: s.employeePfMonthly,
      employerPfMonthly: s.employerPfMonthly,
      professionalTaxMonthly: s.professionalTaxMonthly,
      tdsMonthly: s.tdsMonthly,
      bankName: s.bankName,
      bankAccountLast4: s.bankAccountLast4,
      panNumber: s.panNumber,
    });
  };

  const autoComputeCtcSplit = () => {
    const monthlyGross = Math.round(structForm.annualCtc / 12);
    const basic = Math.round(monthlyGross * 0.5);
    const hra = Math.round(monthlyGross * 0.2);
    const conveyance = 1600;
    const empPf = Math.round(basic * 0.12);
    const employerPf = empPf;
    const special = Math.max(0, monthlyGross - basic - hra - conveyance - employerPf);
    const pt = 200;
    const tds = structForm.annualCtc > 1000000 ? Math.round((monthlyGross * 0.08) / 100) * 100 : 0;
    setStructForm((prev) => ({
      ...prev,
      basicMonthly: basic,
      hraMonthly: hra,
      conveyanceMonthly: conveyance,
      specialAllowanceMonthly: special,
      employeePfMonthly: empPf,
      employerPfMonthly: employerPf,
      professionalTaxMonthly: pt,
      tdsMonthly: tds,
    }));
  };

  const handleSaveStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStructure) return;
    setBusy(true);
    try {
      await PayrollService.updateStructure(editStructure.employeeId, structForm);
      toast('Salary structure updated');
      setEditStructure(null);
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const openPFModal = (a: PFAccount) => {
    setActivePF(a);
    setPfSettings({
      vpfMonthly: String(a.vpfMonthly),
      nomineeName: a.nomineeName,
      kycStatus: a.kycStatus,
    });
  };

  const handleSavePFSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePF) return;
    setBusy(true);
    try {
      const updated = await PayrollService.updatePFAccount(activePF.employeeId, {
        vpfMonthly: Math.max(0, Number(pfSettings.vpfMonthly) || 0),
        nomineeName: pfSettings.nomineeName.trim(),
        ...(canManage ? { kycStatus: pfSettings.kycStatus } : {}),
      });
      setActivePF(updated);
      toast('PF account details saved');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handlePostPFTxn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePF) return;
    setBusy(true);
    try {
      await PayrollService.postPFTransaction({
        employeeId: activePF.employeeId,
        month: pfTxnForm.month,
        type: pfTxnForm.type,
        employeeContribution: Number(pfTxnForm.employeeContribution) || 0,
        employerContribution: Number(pfTxnForm.employerContribution) || 0,
      });
      toast('PF ledger entry posted');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeading
        title="Payroll & PF"
        actions={
          canManage ? (
            <div className="inline-flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setBonusForm((f) => ({
                    ...f,
                    employeeId: d?.refs.employees[0]?.id || '',
                  }));
                  setBonusModalOpen(true);
                }}
              >
                <Gift size={16} /> Award Bonus
              </Button>
              <Button onClick={() => setRunModalOpen(true)}>
                <Play size={16} /> Run Monthly Payroll
              </Button>
            </div>
          ) : null
        }
      />

      <QueryState query={query}>
        {d && (
          <>
            {/* KPI Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-medium">
                    {formatMonthLabel(latestMonth)} Net Payout
                  </span>
                  <IndianRupee className="w-4 h-4 text-[#107C41]" />
                </div>
                <p className="text-2xl font-semibold tabular-nums text-zinc-900 mt-1.5">
                  {formatCurrency(latestNetTotal)}
                </p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-medium">
                    Approved Bonuses
                  </span>
                  <Gift className="w-4 h-4 text-[#107C41]" />
                </div>
                <p className="text-2xl font-semibold tabular-nums text-[#107C41] mt-1.5">
                  {formatCurrency(bonusPoolTotal)}
                </p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-medium">
                    EPF Corpus
                  </span>
                  <PiggyBank className="w-4 h-4 text-[#107C41]" />
                </div>
                <p className="text-2xl font-semibold tabular-nums text-zinc-900 mt-1.5">
                  {formatCurrency(pfTotalCorpus)}
                </p>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-medium">
                    Annual CTC Book
                  </span>
                  <FileSpreadsheet className="w-4 h-4 text-[#107C41]" />
                </div>
                <p className="text-2xl font-semibold tabular-nums text-zinc-900 mt-1.5">
                  {formatCurrency(annualCtcTotal)}
                </p>
              </div>
            </div>

            <Tabs
              tabs={PAYROLL_TABS}
              active={tab}
              onChange={(t) => setParams({ tab: t }, { replace: true })}
            />

            {/* TAB 1: SALARY SLIPS */}
            {tab === 'Salary Slips' && (
              <Panel>
                <div className="filters">
                  <Input
                    label="Search"
                    placeholder="Slip #, employee name, code…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Input
                    label="Month"
                    type="month"
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
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

                <Table<SalarySlip>
                  caption="Monthly salary slips"
                  rows={filteredSlips}
                  columns={[
                    {
                      key: 'slip',
                      title: 'Slip & Period',
                      render: (s) => (
                        <div>
                          <div className="font-mono text-xs font-bold text-gray-900">
                            {s.slipNumber}
                          </div>
                          <small className="text-xs text-gray-500">{s.monthLabel}</small>
                        </div>
                      ),
                    },
                    {
                      key: 'employee',
                      title: 'Employee',
                      render: (s) => {
                        const emp = empMap[s.employeeId];
                        return (
                          <Link
                            to={`/employees/${s.employeeId}?tab=Payroll+%26+PF`}
                            className="inline-flex items-center gap-2 font-semibold text-gray-900 hover:text-[#107C41]"
                          >
                            <span className="w-7 h-7 rounded-full bg-emerald-50 text-[#107C41] text-[11px] font-bold flex items-center justify-center border border-emerald-200 shrink-0">
                              {initials(emp?.name)}
                            </span>
                            <span>{emp?.name || s.employeeId}</span>
                          </Link>
                        );
                      },
                    },
                    {
                      key: 'days',
                      title: 'Paid Days / LOP',
                      render: (s) => (
                        <span className="text-xs text-gray-700">
                          {s.paidDays}/{s.workingDays}d{' '}
                          {s.lopDays > 0 && (
                            <span className="text-rose-600 font-semibold">
                              ({s.lopDays} LOP)
                            </span>
                          )}
                        </span>
                      ),
                    },
                    {
                      key: 'gross',
                      title: 'Gross & Bonus',
                      render: (s) => (
                        <div>
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(s.grossEarnings)}
                          </div>
                          {s.bonusAmount > 0 && (
                            <small className="text-[11px] font-semibold text-[#107C41]">
                              +Bonus {formatCurrency(s.bonusAmount)}
                            </small>
                          )}
                        </div>
                      ),
                    },
                    {
                      key: 'deductions',
                      title: 'PF + Tax + LOP',
                      render: (s) => (
                        <span className="text-rose-600 font-medium">
                          -{formatCurrency(s.totalDeductions)}
                        </span>
                      ),
                    },
                    {
                      key: 'net',
                      title: 'Net Pay',
                      render: (s) => (
                        <strong className="text-[#107C41] font-extrabold">
                          {formatCurrency(s.netPay)}
                        </strong>
                      ),
                    },
                    {
                      key: 'status',
                      title: 'Status',
                      render: (s) => <Badge>{s.status}</Badge>,
                    },
                    {
                      key: 'actions',
                      title: 'Actions',
                      render: (s) => (
                        <div className="inline-flex items-center gap-1.5">
                          <Button variant="outline" onClick={() => setActiveSlip(s)}>
                            <Eye size={14} /> Slip
                          </Button>
                          {canManage && s.status !== 'Paid' && (
                            <Button disabled={busy} onClick={() => handleMarkPaid(s.id)}>
                              <CheckCircle2 size={14} /> Mark Paid
                            </Button>
                          )}
                        </div>
                      ),
                    },
                  ]}
                />
              </Panel>
            )}

            {/* TAB 2: BONUSES */}
            {tab === 'Bonuses' && (
              <Panel
                actions={
                  canManage ? (
                    <Button onClick={() => setBonusModalOpen(true)}>
                      <Plus size={15} /> Award Bonus
                    </Button>
                  ) : null
                }
              >
                <div className="filters">
                  <Input
                    label="Search"
                    placeholder="Employee, bonus type, reason…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Select
                    label="Status"
                    placeholder="All statuses"
                    value={bonusStatusFilter}
                    onChange={(e) => setBonusStatusFilter(e.target.value)}
                    options={[
                      { value: 'Pending', label: 'Pending' },
                      { value: 'Approved', label: 'Approved' },
                      { value: 'Credited', label: 'Credited' },
                      { value: 'Cancelled', label: 'Cancelled' },
                    ]}
                  />
                </div>

                <Table<BonusRecord>
                  caption="Bonus and incentive payouts"
                  rows={filteredBonuses}
                  columns={[
                    {
                      key: 'employee',
                      title: 'Employee',
                      render: (b) => {
                        const emp = empMap[b.employeeId];
                        return (
                          <Link
                            to={`/employees/${b.employeeId}?tab=Payroll+%26+PF`}
                            className="font-semibold text-gray-900 hover:text-[#107C41]"
                          >
                            {emp?.name || b.employeeId}
                          </Link>
                        );
                      },
                    },
                    {
                      key: 'type',
                      title: 'Bonus Type',
                      render: (b) => <Badge>{b.bonusType}</Badge>,
                    },
                    {
                      key: 'month',
                      title: 'Payout Month',
                      render: (b) => formatMonthLabel(b.payoutMonth),
                    },
                    {
                      key: 'amount',
                      title: 'Amount',
                      render: (b) => (
                        <strong className="text-[#107C41]">
                          {formatCurrency(b.amount)}
                        </strong>
                      ),
                    },
                    {
                      key: 'reason',
                      title: 'Reason',
                      render: (b) => (
                        <span className="text-sm text-gray-700">{b.reason}</span>
                      ),
                    },
                    {
                      key: 'status',
                      title: 'Status',
                      render: (b) => <Badge>{b.status}</Badge>,
                    },
                    {
                      key: 'actions',
                      title: 'Actions',
                      render: (b) => (
                        <div className="inline-flex items-center gap-1.5">
                          {canManage && b.status === 'Pending' && (
                            <>
                              <Button
                                disabled={busy}
                                onClick={() => handleBonusStatus(b.id, 'Approved')}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="ghost"
                                disabled={busy}
                                onClick={() => handleBonusStatus(b.id, 'Cancelled')}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {canManage && b.status === 'Approved' && (
                            <Button
                              variant="outline"
                              disabled={busy}
                              onClick={() => handleBonusStatus(b.id, 'Credited')}
                            >
                              Mark Credited
                            </Button>
                          )}
                          {(b.status === 'Credited' || b.status === 'Cancelled' || !canManage) && (
                            <span className="text-xs text-gray-400">
                              {b.creditedAt ? `Paid ${formatDate(b.creditedAt)}` : '—'}
                            </span>
                          )}
                        </div>
                      ),
                    },
                  ]}
                />
              </Panel>
            )}

            {/* TAB 3: PF FUND (EPF) */}
            {tab === 'PF Fund (EPF)' && (
              <Panel>
                <div className="filters">
                  <Input
                    label="Search PF Accounts"
                    placeholder="Employee name, UAN, PF account #…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Table<PFAccount>
                  caption="Employee Provident Fund (EPF) accounts"
                  rows={filteredPF}
                  columns={[
                    {
                      key: 'employee',
                      title: 'Member',
                      render: (a) => {
                        const emp = empMap[a.employeeId];
                        return (
                          <Link
                            to={`/employees/${a.employeeId}?tab=Payroll+%26+PF`}
                            className="font-semibold text-gray-900 hover:text-[#107C41]"
                          >
                            {emp?.name || a.employeeId}
                            <small className="block text-xs font-normal text-gray-400">
                              {emp?.designation}
                            </small>
                          </Link>
                        );
                      },
                    },
                    {
                      key: 'uan',
                      title: 'UAN & Account #',
                      render: (a) => (
                        <div>
                          <div className="font-mono text-xs font-semibold text-gray-900">
                            UAN: {a.uan}
                          </div>
                          <small className="font-mono text-[11px] text-gray-500">
                            {a.pfAccountNumber}
                          </small>
                        </div>
                      ),
                    },
                    {
                      key: 'shares',
                      title: 'Emp / Employer Share',
                      render: (a) => (
                        <div className="text-xs text-gray-700">
                          <div>Emp: {formatCurrency(a.employeeShareTotal)}</div>
                          <div className="text-gray-500">
                            Er: {formatCurrency(a.employerShareTotal)}
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: 'vpf',
                      title: 'Monthly VPF & Interest',
                      render: (a) => (
                        <div className="text-xs">
                          <div>VPF: {formatCurrency(a.vpfMonthly)}/mo</div>
                          <small className="text-[#107C41] font-semibold">
                            +{formatCurrency(a.interestAccruedYtd)} @ {a.interestRate}%
                          </small>
                        </div>
                      ),
                    },
                    {
                      key: 'total',
                      title: 'Total PF Corpus',
                      render: (a) => (
                        <strong className="text-[#107C41] font-extrabold">
                          {formatCurrency(a.totalBalance)}
                        </strong>
                      ),
                    },
                    {
                      key: 'kyc',
                      title: 'KYC & Nominee',
                      render: (a) => (
                        <div>
                          <Badge>{a.kycStatus}</Badge>
                          <small className="block text-[11px] text-gray-500 mt-0.5">
                            {a.nomineeName}
                          </small>
                        </div>
                      ),
                    },
                    {
                      key: 'actions',
                      title: 'Passbook',
                      render: (a) => (
                        <Button variant="outline" onClick={() => openPFModal(a)}>
                          <BookOpen size={14} /> Passbook
                        </Button>
                      ),
                    },
                  ]}
                />
              </Panel>
            )}

            {/* TAB 4: SALARY STRUCTURES */}
            {tab === 'Salary Structures' && (
              <Panel>
                <div className="filters">
                  <Input
                    label="Search structures"
                    placeholder="Employee name, bank, PAN…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Table<SalaryStructure>
                  caption="Employee compensation structures"
                  rows={filteredStructures}
                  columns={[
                    {
                      key: 'employee',
                      title: 'Employee',
                      render: (s) => {
                        const emp = empMap[s.employeeId];
                        return (
                          <Link
                            to={`/employees/${s.employeeId}?tab=Payroll+%26+PF`}
                            className="font-semibold text-gray-900 hover:text-[#107C41]"
                          >
                            {emp?.name || s.employeeId}
                            <small className="block text-xs font-normal text-gray-400">
                              {emp?.designation}
                            </small>
                          </Link>
                        );
                      },
                    },
                    {
                      key: 'ctc',
                      title: 'Annual CTC',
                      render: (s) => (
                        <strong className="text-gray-900">
                          {formatCurrency(s.annualCtc)}
                        </strong>
                      ),
                    },
                    {
                      key: 'earnings',
                      title: 'Monthly Earnings',
                      render: (s) => (
                        <div className="text-xs text-gray-700">
                          <div>Basic: {formatCurrency(s.basicMonthly)}</div>
                          <div className="text-gray-500">
                            HRA: {formatCurrency(s.hraMonthly)} · Spl:{' '}
                            {formatCurrency(
                              s.specialAllowanceMonthly + s.conveyanceMonthly
                            )}
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: 'deductions',
                      title: 'Monthly Statutory',
                      render: (s) => (
                        <div className="text-xs text-gray-700">
                          <div>PF (12%): {formatCurrency(s.employeePfMonthly)}</div>
                          <div className="text-gray-500">
                            TDS: {formatCurrency(s.tdsMonthly)} · PT:{' '}
                            {formatCurrency(s.professionalTaxMonthly)}
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: 'bank',
                      title: 'Bank & PAN',
                      render: (s) => (
                        <div className="text-xs">
                          <div>
                            {s.bankName} (••••{s.bankAccountLast4})
                          </div>
                          <small className="font-mono text-gray-500">{s.panNumber}</small>
                        </div>
                      ),
                    },
                    {
                      key: 'actions',
                      title: 'Manage',
                      render: (s) =>
                        canManage ? (
                          <Button variant="outline" onClick={() => openStructureEdit(s)}>
                            <Edit3 size={14} /> Edit CTC
                          </Button>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Eff. {formatDate(s.effectiveFrom)}
                          </span>
                        ),
                    },
                  ]}
                />
              </Panel>
            )}
          </>
        )}
      </QueryState>

      {/* Payslip Modal */}
      {activeSlip && (
        <SalarySlipModal
          slip={activeSlip}
          employee={empMap[activeSlip.employeeId]}
          organisation={organisation}
          structure={structMap[activeSlip.employeeId]}
          pfAccount={pfMap[activeSlip.employeeId]}
          canManage={canManage}
          onMarkPaid={handleMarkPaid}
          onClose={() => setActiveSlip(null)}
        />
      )}

      {/* Run Payroll Modal */}
      {runModalOpen && (
        <Modal title="Run Monthly Payroll" onClose={() => setRunModalOpen(false)} busy={busy}>
          <form onSubmit={handleRunPayroll}>
            <div className="modal-body">
              <Input
                label="Payroll Month"
                type="month"
                required
                value={runMonth}
                onChange={(e) => setRunMonth(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                Generates or recalculates draft/processed slips for all employees in the selected
                month. Approved unpaid LOP days are deducted proportionally, approved bonuses for{' '}
                <strong>{formatMonthLabel(runMonth)}</strong> are included, and each slip receives
                a SHA-256 verification seal.
              </p>
            </div>
            <div className="modal-footer">
              <Button variant="ghost" onClick={() => setRunModalOpen(false)} disabled={busy}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                <Play size={15} /> Generate Salary Slips
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Award Bonus Modal */}
      {bonusModalOpen && d && (
        <Modal title="Award Bonus / Incentive" onClose={() => setBonusModalOpen(false)} busy={busy}>
          <form onSubmit={handleAwardBonus}>
            <div className="modal-body">
              <div className="form-grid">
                <Select
                  label="Employee"
                  value={bonusForm.employeeId}
                  onChange={(e) =>
                    setBonusForm((f) => ({ ...f, employeeId: e.target.value }))
                  }
                  options={d.refs.employees.map((emp) => ({
                    value: emp.id,
                    label: `${emp.name} (${emp.employeeId})`,
                  }))}
                />
                <Select
                  label="Bonus Type"
                  value={bonusForm.bonusType}
                  onChange={(e) =>
                    setBonusForm((f) => ({ ...f, bonusType: e.target.value as BonusType }))
                  }
                  options={BONUS_TYPES.map((t) => ({ value: t, label: t }))}
                />
                <Input
                  label="Amount (INR)"
                  type="number"
                  min="1"
                  required
                  value={bonusForm.amount}
                  onChange={(e) => setBonusForm((f) => ({ ...f, amount: e.target.value }))}
                />
                <Input
                  label="Payout Month"
                  type="month"
                  required
                  value={bonusForm.payoutMonth}
                  onChange={(e) =>
                    setBonusForm((f) => ({ ...f, payoutMonth: e.target.value }))
                  }
                />
                <Select
                  label="Approval Status"
                  value={bonusForm.status}
                  onChange={(e) =>
                    setBonusForm((f) => ({ ...f, status: e.target.value as BonusStatus }))
                  }
                  options={[
                    { value: 'Approved', label: 'Approved (Include in Payroll)' },
                    { value: 'Pending', label: 'Pending Review' },
                    { value: 'Credited', label: 'Credited Off-Cycle' },
                  ]}
                />
              </div>
              <label className="field mt-4">
                <span>Reason / Performance Note</span>
                <textarea
                  rows={2}
                  required
                  placeholder="Q3 impact, appraisal cycle, spot recognition…"
                  value={bonusForm.reason}
                  onChange={(e) => setBonusForm((f) => ({ ...f, reason: e.target.value }))}
                />
              </label>
            </div>
            <div className="modal-footer">
              <Button variant="ghost" onClick={() => setBonusModalOpen(false)} disabled={busy}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                Save Bonus
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Salary Structure Modal */}
      {editStructure && (
        <Modal
          title={`Edit Compensation · ${empMap[editStructure.employeeId]?.name || ''}`}
          wide
          onClose={() => setEditStructure(null)}
          busy={busy}
        >
          <form onSubmit={handleSaveStructure}>
            <div className="modal-body">
              <div className="flex flex-wrap items-end gap-3 mb-4 p-3 rounded-xl bg-gray-50 border border-gray-200/80">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    label="Annual CTC (INR)"
                    type="number"
                    min="0"
                    required
                    value={structForm.annualCtc}
                    onChange={(e) =>
                      setStructForm((f) => ({ ...f, annualCtc: Number(e.target.value) || 0 }))
                    }
                  />
                </div>
                <Button variant="outline" onClick={autoComputeCtcSplit}>
                  Auto-Compute Split
                </Button>
              </div>
              <div className="form-grid">
                <Input
                  label="Basic (Monthly)"
                  type="number"
                  value={structForm.basicMonthly}
                  onChange={(e) =>
                    setStructForm((f) => ({ ...f, basicMonthly: Number(e.target.value) || 0 }))
                  }
                />
                <Input
                  label="HRA (Monthly)"
                  type="number"
                  value={structForm.hraMonthly}
                  onChange={(e) =>
                    setStructForm((f) => ({ ...f, hraMonthly: Number(e.target.value) || 0 }))
                  }
                />
                <Input
                  label="Special Allowance"
                  type="number"
                  value={structForm.specialAllowanceMonthly}
                  onChange={(e) =>
                    setStructForm((f) => ({
                      ...f,
                      specialAllowanceMonthly: Number(e.target.value) || 0,
                    }))
                  }
                />
                <Input
                  label="Conveyance"
                  type="number"
                  value={structForm.conveyanceMonthly}
                  onChange={(e) =>
                    setStructForm((f) => ({
                      ...f,
                      conveyanceMonthly: Number(e.target.value) || 0,
                    }))
                  }
                />
                <Input
                  label="Employee PF (12%)"
                  type="number"
                  value={structForm.employeePfMonthly}
                  onChange={(e) =>
                    setStructForm((f) => ({
                      ...f,
                      employeePfMonthly: Number(e.target.value) || 0,
                    }))
                  }
                />
                <Input
                  label="Employer PF (12%)"
                  type="number"
                  value={structForm.employerPfMonthly}
                  onChange={(e) =>
                    setStructForm((f) => ({
                      ...f,
                      employerPfMonthly: Number(e.target.value) || 0,
                    }))
                  }
                />
                <Input
                  label="Professional Tax"
                  type="number"
                  value={structForm.professionalTaxMonthly}
                  onChange={(e) =>
                    setStructForm((f) => ({
                      ...f,
                      professionalTaxMonthly: Number(e.target.value) || 0,
                    }))
                  }
                />
                <Input
                  label="TDS (Monthly)"
                  type="number"
                  value={structForm.tdsMonthly}
                  onChange={(e) =>
                    setStructForm((f) => ({ ...f, tdsMonthly: Number(e.target.value) || 0 }))
                  }
                />
                <Input
                  label="Bank Name"
                  value={structForm.bankName}
                  onChange={(e) =>
                    setStructForm((f) => ({ ...f, bankName: e.target.value }))
                  }
                />
                <Input
                  label="Account Last 4"
                  maxLength={4}
                  value={structForm.bankAccountLast4}
                  onChange={(e) =>
                    setStructForm((f) => ({ ...f, bankAccountLast4: e.target.value }))
                  }
                />
                <Input
                  label="PAN Number"
                  value={structForm.panNumber}
                  onChange={(e) =>
                    setStructForm((f) => ({ ...f, panNumber: e.target.value.toUpperCase() }))
                  }
                />
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="ghost" onClick={() => setEditStructure(null)} disabled={busy}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                Update Structure
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* PF Passbook & Account Modal */}
      {activePF && d && (
        <Modal
          title={`EPF Passbook · ${empMap[activePF.employeeId]?.name || ''}`}
          wide
          onClose={() => setActivePF(null)}
          busy={busy}
        >
          <div className="modal-body space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-[11px] font-semibold text-gray-500 uppercase">
                  Total Balance
                </span>
                <p className="text-lg font-semibold tabular-nums text-[#107C41]">
                  {formatCurrency(activePF.totalBalance)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-[11px] font-semibold text-gray-500 uppercase">
                  Employee Share
                </span>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(activePF.employeeShareTotal)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-[11px] font-semibold text-gray-500 uppercase">
                  Employer Share
                </span>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(activePF.employerShareTotal)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-[11px] font-semibold text-gray-500 uppercase">
                  YTD Interest ({activePF.interestRate}%)
                </span>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(activePF.interestAccruedYtd)}
                </p>
              </div>
            </div>

            {/* Settings / VPF Nomination */}
            <form
              onSubmit={handleSavePFSettings}
              className="p-4 rounded-xl border border-gray-200/80 bg-gray-50/50 space-y-3"
            >
              <div className="form-grid">
                <Input
                  label="Voluntary PF / month (VPF ₹)"
                  type="number"
                  min="0"
                  value={pfSettings.vpfMonthly}
                  onChange={(e) =>
                    setPfSettings((s) => ({ ...s, vpfMonthly: e.target.value }))
                  }
                />
                <Input
                  label="Nominee Name"
                  value={pfSettings.nomineeName}
                  onChange={(e) =>
                    setPfSettings((s) => ({ ...s, nomineeName: e.target.value }))
                  }
                />
                {canManage && (
                  <Select
                    label="EPFO KYC Status"
                    value={pfSettings.kycStatus}
                    onChange={(e) =>
                      setPfSettings((s) => ({
                        ...s,
                        kycStatus: e.target.value as 'Verified' | 'Pending',
                      }))
                    }
                    options={[
                      { value: 'Verified', label: 'Verified' },
                      { value: 'Pending', label: 'Pending' },
                    ]}
                  />
                )}
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="outline" disabled={busy}>
                  Save PF Preferences
                </Button>
              </div>
            </form>

            {/* Admin Manual PF Entry */}
            {canManage && (
              <form
                onSubmit={handlePostPFTxn}
                className="p-4 rounded-xl border border-gray-200/80 space-y-3"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Post PF Ledger Entry
                </div>
                <div className="form-grid">
                  <Select
                    label="Transaction Type"
                    value={pfTxnForm.type}
                    onChange={(e) =>
                      setPfTxnForm((t) => ({
                        ...t,
                        type: e.target.value as PFTransaction['type'],
                      }))
                    }
                    options={[
                      { value: 'Monthly Contribution', label: 'Monthly Contribution' },
                      { value: 'VPF', label: 'VPF Contribution' },
                      { value: 'Interest Credit', label: 'Interest Credit' },
                      { value: 'PF Advance', label: 'PF Advance / Withdrawal (-)' },
                    ]}
                  />
                  <Input
                    label="Month"
                    type="month"
                    value={pfTxnForm.month}
                    onChange={(e) => setPfTxnForm((t) => ({ ...t, month: e.target.value }))}
                  />
                  <Input
                    label="Employee Contribution (INR)"
                    type="number"
                    value={pfTxnForm.employeeContribution}
                    onChange={(e) =>
                      setPfTxnForm((t) => ({
                        ...t,
                        employeeContribution: e.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Employer Contribution (INR)"
                    type="number"
                    value={pfTxnForm.employerContribution}
                    onChange={(e) =>
                      setPfTxnForm((t) => ({
                        ...t,
                        employerContribution: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={busy}>
                    Post Ledger Entry
                  </Button>
                </div>
              </form>
            )}

            {/* Ledger History */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Passbook History ({activePF.pfAccountNumber})
              </h3>
              <Table<PFTransaction>
                caption="PF passbook transactions"
                pageSize={5}
                rows={d.pfTransactions.filter((t) => t.employeeId === activePF.employeeId)}
                columns={[
                  {
                    key: 'month',
                    title: 'Month',
                    render: (t) => formatMonthLabel(t.month),
                  },
                  {
                    key: 'type',
                    title: 'Type',
                    render: (t) => <Badge>{t.type}</Badge>,
                  },
                  {
                    key: 'emp',
                    title: 'Employee',
                    render: (t) => formatCurrency(t.employeeContribution),
                  },
                  {
                    key: 'er',
                    title: 'Employer',
                    render: (t) => formatCurrency(t.employerContribution),
                  },
                  {
                    key: 'total',
                    title: 'Net Entry',
                    render: (t) => (
                      <strong
                        className={t.totalAmount < 0 ? 'text-rose-600' : 'text-[#107C41]'}
                      >
                        {t.totalAmount >= 0 ? '+' : ''}
                        {formatCurrency(t.totalAmount)}
                      </strong>
                    ),
                  },
                  {
                    key: 'bal',
                    title: 'Balance After',
                    render: (t) => formatCurrency(t.balanceAfter),
                  },
                ]}
              />
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="ghost" onClick={() => setActivePF(null)}>
              Close
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

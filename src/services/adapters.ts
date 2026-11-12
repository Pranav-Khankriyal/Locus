import type {
  Asset,
  AssetAssignment,
  AssetCategory,
  AttendanceRecord,
  AuditEvent,
  BonusRecord,
  Employee,
  Holiday,
  LeaveBalance,
  LeaveRequest,
  Organisation,
  OrganisationUnit,
  OrgRequest,
  PFAccount,
  PFTransaction,
  Role,
  SalarySlip,
  SalaryStructure,
} from '@/types';

type Raw = Record<string, unknown>;
const text = (v: unknown) => String(v ?? '');
const optText = (v: unknown) => (v === undefined || v === null ? null : String(v));
const title = (v: string) => v.split('_').map((x) => x[0]?.toUpperCase() + x.slice(1)).join(' ');

export const adaptOrganisation = (o: any): Organisation => ({
  id: text(o.id),
  name: o.name,
  slug: o.code,
  createdAt: text(o.created_at),
  rootUnitId: '',
  contact: o.description || undefined,
});

export const adaptEmployee = (e: any): Employee => ({
  id: text(e.id),
  employeeId: e.employee_code || e.employeeId || text(e.id),
  name: e.name || `${e.first_name || ''} ${e.last_name || ''}`.trim() || 'Team Member',
  email: e.email,
  designation: e.designation || 'Team Member',
  organisationUnitId: text(e.organization_unit_id || e.organisationUnitId),
  managerId: e.manager_employee_id ? text(e.manager_employee_id) : (e.managerId ? text(e.managerId) : null),
  status: (e.employment_status === 'active' || e.status === 'Active') ? 'Active' : 'Inactive',
  role: e.role || 'employee',
  identityStatus: (e.identityStatus || 'Verified') as any,
  createdAt: text(e.created_at || e.createdAt),
});

export const adaptUnit = (u: any): OrganisationUnit => ({
  id: text(u.id),
  name: u.name,
  type: u.unit_type || u.type || 'department',
  parentId: u.parent_unit_id ? text(u.parent_unit_id) : (u.parentId ? text(u.parentId) : null),
  managerId: null,
  employeeCount: 0,
  assetCount: 0,
  depth: 0,
});

export const adaptCategory = (c: any): AssetCategory => ({
  id: text(c.id),
  name: c.name,
  parentId: 'api',
  type: c.type === 'Digital' ? 'Digital' : 'Physical',
});

export const adaptAsset = (a: any): Asset => ({
  id: text(a.id),
  assetId: a.asset_code || a.assetId || `AST-${text(a.id).slice(-4)}`,
  name: a.name,
  type: (a.asset_type === 'Digital' || a.type === 'Digital') ? 'Digital' : 'Physical',
  category: text(a.asset_category_id || a.category),
  subCategory: a.description || '',
  serialNumber: a.serial_number || a.serialNumber || '',
  condition: String(a.metadata?.condition || a.condition || 'Good'),
  status: (title(String(a.status).toLowerCase()) as Asset['status']) || 'Available',
  locationId: a.location || a.locationId || 'HQ',
  organisationUnitId: '',
  currentAssigneeId: a.current_employee_id ? text(a.current_employee_id) : (a.currentAssigneeId ? text(a.currentAssigneeId) : null),
  blockchainStatus: ((a.integrity_status === 'Verified' || a.blockchainStatus === 'Verified') ? 'Verified' : 'Pending') as any,
  tokenId: null,
  createdAt: text(a.created_at || a.createdAt),
  expiresAt: a.metadata?.expires_at || a.expiresAt,
});

export const adaptRole = (r: any): Role => ({
  id: text(r.id),
  name: r.name,
  description: r.description || '',
  permissions: (r.permissions || []).map((p: any) => {
    const [resource, action] = String(p.code || '').split('.');
    return {
      id: text(p.id),
      resource:
        resource === 'employee'
          ? 'employees'
          : resource === 'asset'
          ? 'assets'
          : resource === 'role'
          ? 'roles'
          : resource === 'verification'
          ? 'verification'
          : resource === 'audit'
          ? 'audit'
          : resource === 'organisation'
          ? 'organisation'
          : resource === 'attendance'
          ? 'attendance'
          : resource === 'leaves'
          ? 'leaves'
          : resource === 'payroll'
          ? 'payroll'
          : resource === 'requests'
          ? 'requests'
          : 'settings',
      action: ['create', 'update', 'delete', 'manage', 'manage_units'].includes(action)
        ? 'manage'
        : action === 'read'
        ? 'view'
        : action,
      scope: 'all',
    } as any;
  }),
  isSystem: r.name === 'Organisation Administrator' || Boolean(r.is_system),
});

export const adaptTransaction = (t: any): AssetAssignment => ({
  id: text(t.id),
  assetId: text(t.asset_id || t.assetId),
  assigneeId: text(t.new_employee_id || t.assigneeId),
  assignedById: text(t.performed_by_user_id || t.assignedById),
  assignedAt: text(t.created_at || t.assignedAt),
  returnedAt: t.transaction_type === 'RETURN' ? text(t.created_at) : null,
  reason: t.notes || '',
  status: t.transaction_type === 'RETURN' ? 'Returned' : t.transaction_type === 'TRANSFER' ? 'Transferred' : 'Active',
  transactionRef: text(t.id),
});

export const adaptAudit = (a: any): AuditEvent => ({
  id: text(a.id),
  actorId: text(a.actor_user_id || a.actorId),
  action: a.action,
  entity: (a.entity_type || a.entity || 'Asset') as AuditEvent['entity'],
  entityId: text(a.entity_id || a.entityId),
  status: 'Success',
  metadata: a.metadata || {},
  createdAt: text(a.created_at || a.createdAt),
});

export const adaptIdentity = (i: any): any => ({
  id: text(i.id),
  employeeId: text(i.employee_id || i.employeeId),
  did: text(i.did),
  status: text(i.status || 'Verified'),
  verifiedAt: i.verified_at ? text(i.verified_at) : (i.verifiedAt ? text(i.verifiedAt) : null),
});

export const adaptAttendance = (a: Raw): AttendanceRecord => ({
  id: text(a.id),
  employeeId: text(a.employee_id || a.employeeId),
  date: text(a.date),
  checkIn: optText(a.check_in ?? a.checkIn),
  checkOut: optText(a.check_out ?? a.checkOut),
  workHours: Number(a.work_hours ?? a.workHours ?? 0),
  status: text(a.status || 'Present') as AttendanceRecord['status'],
  workMode: text(a.work_mode || a.workMode || 'Office') as AttendanceRecord['workMode'],
  location: text(a.location || 'HQ'),
  notes: text(a.notes || ''),
  updatedAt: text(a.updated_at || a.updatedAt),
});

export const adaptLeaveBalance = (b: Raw): LeaveBalance => ({
  employeeId: text(b.employee_id || b.employeeId),
  year: Number(b.year || 2026),
  paidTotal: Number(b.paid_total ?? b.paidTotal ?? 18),
  paidUsed: Number(b.paid_used ?? b.paidUsed ?? 0),
  sickTotal: Number(b.sick_total ?? b.sickTotal ?? 10),
  sickUsed: Number(b.sick_used ?? b.sickUsed ?? 0),
  casualTotal: Number(b.casual_total ?? b.casualTotal ?? 8),
  casualUsed: Number(b.casual_used ?? b.casualUsed ?? 0),
  privilegeTotal: Number(b.privilege_total ?? b.privilegeTotal ?? 12),
  privilegeUsed: Number(b.privilege_used ?? b.privilegeUsed ?? 0),
  compOff: Number(b.comp_off ?? b.compOff ?? 0),
  unpaidTaken: Number(b.unpaid_taken ?? b.unpaidTaken ?? 0),
});

export const adaptLeaveRequest = (r: Raw): LeaveRequest => ({
  id: text(r.id),
  employeeId: text(r.employee_id || r.employeeId),
  leaveType: text(r.leave_type || r.leaveType || 'Paid Leave') as LeaveRequest['leaveType'],
  startDate: text(r.start_date || r.startDate),
  endDate: text(r.end_date || r.endDate),
  days: Number(r.days || 1),
  isPaid: r.is_paid !== undefined ? Boolean(r.is_paid) : Boolean(r.isPaid ?? true),
  reason: text(r.reason),
  status: text(r.status || 'Pending') as LeaveRequest['status'],
  reviewedById: optText(r.reviewed_by_id ?? r.reviewedById),
  reviewedAt: optText(r.reviewed_at ?? r.reviewedAt),
  reviewerNotes: optText(r.reviewer_notes ?? r.reviewerNotes),
  createdAt: text(r.created_at || r.createdAt),
});

export const adaptHoliday = (h: Raw): Holiday => ({
  id: text(h.id),
  name: text(h.name),
  date: text(h.date),
  type: text(h.type || 'Public') as Holiday['type'],
});

export const adaptSalaryStructure = (s: Raw): SalaryStructure => ({
  id: text(s.id),
  employeeId: text(s.employee_id || s.employeeId),
  currency: s.currency === 'USD' ? 'USD' : 'INR',
  annualCtc: Number(s.annual_ctc ?? s.annualCtc ?? 0),
  basicMonthly: Number(s.basic_monthly ?? s.basicMonthly ?? 0),
  hraMonthly: Number(s.hra_monthly ?? s.hraMonthly ?? 0),
  specialAllowanceMonthly: Number(s.special_allowance_monthly ?? s.specialAllowanceMonthly ?? 0),
  conveyanceMonthly: Number(s.conveyance_monthly ?? s.conveyanceMonthly ?? 0),
  employeePfMonthly: Number(s.employee_pf_monthly ?? s.employeePfMonthly ?? 0),
  employerPfMonthly: Number(s.employer_pf_monthly ?? s.employerPfMonthly ?? 0),
  professionalTaxMonthly: Number(s.professional_tax_monthly ?? s.professionalTaxMonthly ?? 0),
  tdsMonthly: Number(s.tds_monthly ?? s.tdsMonthly ?? 0),
  bankName: text(s.bank_name || s.bankName || 'HDFC Bank'),
  bankAccountLast4: text(s.bank_account_last4 || s.bankAccountLast4 || '4810'),
  panNumber: text(s.pan_number || s.panNumber || 'ABCDE1234F'),
  effectiveFrom: text(s.effective_from || s.effectiveFrom),
  updatedAt: text(s.updated_at || s.updatedAt),
});

export const adaptSalarySlip = (s: Raw): SalarySlip => ({
  id: text(s.id),
  slipNumber: text(s.slip_number || s.slipNumber),
  employeeId: text(s.employee_id || s.employeeId),
  month: text(s.month),
  monthLabel: text(s.month_label || s.monthLabel),
  workingDays: Number(s.working_days ?? s.workingDays ?? 22),
  paidDays: Number(s.paid_days ?? s.paidDays ?? 22),
  paidLeavesUsed: Number(s.paid_leaves_used ?? s.paidLeavesUsed ?? 0),
  lopDays: Number(s.lop_days ?? s.lopDays ?? 0),
  basic: Number(s.basic ?? 0),
  hra: Number(s.hra ?? 0),
  specialAllowance: Number(s.special_allowance ?? s.specialAllowance ?? 0),
  conveyance: Number(s.conveyance ?? 0),
  bonusAmount: Number(s.bonus_amount ?? s.bonusAmount ?? 0),
  grossEarnings: Number(s.gross_earnings ?? s.grossEarnings ?? 0),
  employeePf: Number(s.employee_pf ?? s.employeePf ?? 0),
  employerPf: Number(s.employer_pf ?? s.employerPf ?? 0),
  professionalTax: Number(s.professional_tax ?? s.professionalTax ?? 0),
  tds: Number(s.tds ?? 0),
  lopDeduction: Number(s.lop_deduction ?? s.lopDeduction ?? 0),
  totalDeductions: Number(s.total_deductions ?? s.totalDeductions ?? 0),
  netPay: Number(s.net_pay ?? s.netPay ?? 0),
  status: text(s.status || 'Processed') as SalarySlip['status'],
  sealRef: text(s.seal_ref || s.sealRef),
  paidAt: optText(s.paid_at ?? s.paidAt),
  generatedAt: text(s.generated_at || s.generatedAt),
});

export const adaptBonus = (b: Raw): BonusRecord => ({
  id: text(b.id),
  employeeId: text(b.employee_id || b.employeeId),
  bonusType: text(b.bonus_type || b.bonusType || 'Performance Bonus') as BonusRecord['bonusType'],
  amount: Number(b.amount ?? 0),
  payoutMonth: text(b.payout_month || b.payoutMonth),
  reason: text(b.reason),
  status: text(b.status || 'Pending') as BonusRecord['status'],
  approvedById: optText(b.approved_by_id ?? b.approvedById),
  createdAt: text(b.created_at || b.createdAt),
  creditedAt: optText(b.credited_at ?? b.creditedAt),
});

export const adaptPFAccount = (p: Raw): PFAccount => ({
  id: text(p.id),
  employeeId: text(p.employee_id || p.employeeId),
  uan: text(p.uan),
  pfAccountNumber: text(p.pf_account_number || p.pfAccountNumber),
  totalBalance: Number(p.total_balance ?? p.totalBalance ?? 0),
  employeeShareTotal: Number(p.employee_share_total ?? p.employeeShareTotal ?? 0),
  employerShareTotal: Number(p.employer_share_total ?? p.employerShareTotal ?? 0),
  vpfMonthly: Number(p.vpf_monthly ?? p.vpfMonthly ?? 0),
  interestRate: Number(p.interest_rate ?? p.interestRate ?? 8.25),
  interestAccruedYtd: Number(p.interest_accrued_ytd ?? p.interestAccruedYtd ?? 0),
  kycStatus: p.kyc_status === 'Pending' ? 'Pending' : 'Verified',
  nomineeName: text(p.nominee_name || p.nomineeName || 'Family Nominee'),
  status: p.status === 'Settled' ? 'Settled' : 'Active',
  updatedAt: text(p.updated_at || p.updatedAt),
});

export const adaptPFTransaction = (t: Raw): PFTransaction => ({
  id: text(t.id),
  employeeId: text(t.employee_id || t.employeeId),
  month: text(t.month),
  type: text(t.type || 'Monthly Contribution') as PFTransaction['type'],
  employeeContribution: Number(t.employee_contribution ?? t.employeeContribution ?? 0),
  employerContribution: Number(t.employer_contribution ?? t.employerContribution ?? 0),
  totalAmount: Number(t.total_amount ?? t.totalAmount ?? 0),
  balanceAfter: Number(t.balance_after ?? t.balanceAfter ?? 0),
  reference: text(t.reference),
  createdAt: text(t.created_at || t.createdAt),
});

export const adaptOrgRequest = (r: Raw): OrgRequest => ({
  id: text(r.id),
  requestNumber: text(r.request_number || r.requestNumber),
  employeeId: text(r.employee_id || r.employeeId),
  category: text(r.category || 'General') as OrgRequest['category'],
  title: text(r.title),
  description: text(r.description),
  priority: text(r.priority || 'Medium') as OrgRequest['priority'],
  amount: r.amount !== undefined && r.amount !== null ? Number(r.amount) : undefined,
  status: text(r.status || 'Pending') as OrgRequest['status'],
  reviewedById: optText(r.reviewed_by_id ?? r.reviewedById),
  reviewerNotes: optText(r.reviewer_notes ?? r.reviewerNotes),
  createdAt: text(r.created_at || r.createdAt),
  updatedAt: text(r.updated_at || r.updatedAt),
});

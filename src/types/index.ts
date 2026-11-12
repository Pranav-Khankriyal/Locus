export type Resource =
  | 'employees'
  | 'assets'
  | 'organisation'
  | 'roles'
  | 'audit'
  | 'verification'
  | 'settings'
  | 'attendance'
  | 'leaves'
  | 'payroll'
  | 'requests';
export type Action = 'view' | 'manage' | 'assign' | 'audit';
export type Scope = 'all' | 'team' | 'own';
export type Status = 'Active' | 'Inactive';
export type IdentityStatus = 'Verified' | 'Pending' | 'Revoked';
export interface Organisation { id: string; name: string; slug: string; createdAt: string; rootUnitId: string; contact?: string; logo?: string }
export interface OrganisationUnit { id: string; name: string; type: string; parentId: string | null; managerId: string | null; employeeCount: number; assetCount: number; depth: number; deletedAt?: string }
export interface TreeNode extends OrganisationUnit { children: TreeNode[] }
export interface Employee { id: string; employeeId: string; name: string; email: string; designation: string; organisationUnitId: string; managerId: string | null; status: Status; role: string; identityStatus: IdentityStatus; createdAt: string; deletedAt?: string }
export interface Permission { id: string; resource: Resource; action: Action; scope: Scope }
export interface Role { id: string; name: string; description: string; permissions: Permission[]; isSystem: boolean; deletedAt?: string }
export type AssetStatus = 'Assigned' | 'Available' | 'In Maintenance' | 'Returned';
export type AssetType = 'Physical' | 'Digital';
export interface Asset { id: string; assetId: string; name: string; type: AssetType; category: string; subCategory: string; serialNumber: string; condition: string; status: AssetStatus; locationId: string; organisationUnitId: string; currentAssigneeId: string | null; blockchainStatus: 'Verified' | 'Pending' | 'Unregistered'; tokenId: string | null; createdAt: string; expiresAt?: string }
export interface AssetCategory { id: string; name: string; parentId: string | null; type: AssetType }
export interface AssetAssignment { id: string; assetId: string; assigneeId: string; assignedById: string; assignedAt: string; returnedAt: string | null; reason: string; status: 'Active' | 'Transferred' | 'Returned'; transactionRef: string }
export type AuditEntity =
  | 'Employee'
  | 'Asset'
  | 'Organisation'
  | 'Role'
  | 'Identity'
  | 'Attendance'
  | 'Leave'
  | 'Payroll'
  | 'Bonus'
  | 'PF'
  | 'Request';
export interface AuditEvent { id: string; actorId: string; action: string; entity: AuditEntity; entityId: string; status: 'Success' | 'Failed' | 'Pending'; metadata: Record<string, string>; createdAt: string }
export interface Identity { id: string; employeeId: string; did: string; status: IdentityStatus; verifiedAt: string | null }
export interface Notification { id: string; type: 'success' | 'error' | 'warning' | 'info'; title: string; message: string; read: boolean; createdAt: string; link: string }
export interface ToastMessage { id: string; type: Notification['type']; message: string }
export interface EmployeeQuery { search?: string; unitId?: string; role?: string; status?: string }
export interface AssetQuery { search?: string; type?: string; category?: string; status?: string; assigneeId?: string; unitId?: string }
export interface AuditQuery { search?: string; actorId?: string; action?: string; entity?: string; entityId?: string; status?: string; from?: string; to?: string; employeeId?: string }
export type CreateEmployeeInput = Omit<Employee, 'id' | 'employeeId' | 'createdAt' | 'deletedAt'> & { employeeId?: string };
export type UpdateEmployeeInput = Partial<CreateEmployeeInput>;
export type CreateAssetInput = Omit<Asset, 'id' | 'assetId' | 'createdAt' | 'currentAssigneeId' | 'blockchainStatus' | 'tokenId'>;
export type UnitInput = Pick<OrganisationUnit, 'name' | 'type' | 'parentId' | 'managerId'>;
export interface ImportRow { row: number; values: Record<string, string>; input?: CreateEmployeeInput; errors: string[]; warnings: string[] }
export interface ImportResult { status: 'success' | 'partial' | 'failed'; imported: number; skipped: number; employees: Employee[]; errors: string[] }
export interface VerificationResultData { verified: boolean; kind: 'Identity' | 'Asset' | 'Authorization'; name: string; id: string; record: string; message: string; transactionRef: string; checkedAt: string }
export interface Database { organisations: Organisation[]; activeOrganisationId: string; units: OrganisationUnit[]; employees: Employee[]; assets: Asset[]; categories: AssetCategory[]; assignments: AssetAssignment[]; roles: Role[]; audit: AuditEvent[]; identities: Identity[] }
export interface SessionRecord { userId: string; organisationId: string | null; mockToken: string; expiresAt: number; pendingUser?: Employee }

// === Enterprise People, Attendance, Leaves, Payroll, PF & Requests ===

export type AttendanceStatus = 'Present' | 'Late' | 'Half Day' | 'Absent' | 'WFH' | 'On Leave';
export type WorkMode = 'Office' | 'Remote' | 'Hybrid';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workHours: number;
  status: AttendanceStatus;
  workMode: WorkMode;
  location: string;
  notes: string;
  updatedAt: string;
}

export type LeaveType =
  | 'Paid Leave'
  | 'Sick Leave'
  | 'Casual Leave'
  | 'Privilege Leave'
  | 'Unpaid Leave'
  | 'Comp Off';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface LeaveBalance {
  employeeId: string;
  year: number;
  paidTotal: number;
  paidUsed: number;
  sickTotal: number;
  sickUsed: number;
  casualTotal: number;
  casualUsed: number;
  privilegeTotal: number;
  privilegeUsed: number;
  compOff: number;
  unpaidTaken: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  isPaid: boolean;
  reason: string;
  status: LeaveStatus;
  reviewedById: string | null;
  reviewedAt: string | null;
  reviewerNotes: string | null;
  createdAt: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'Public' | 'Company' | 'Optional';
}

export interface SalaryStructure {
  id: string;
  employeeId: string;
  currency: 'INR' | 'USD';
  annualCtc: number;
  basicMonthly: number;
  hraMonthly: number;
  specialAllowanceMonthly: number;
  conveyanceMonthly: number;
  employeePfMonthly: number;
  employerPfMonthly: number;
  professionalTaxMonthly: number;
  tdsMonthly: number;
  bankName: string;
  bankAccountLast4: string;
  panNumber: string;
  effectiveFrom: string;
  updatedAt: string;
}

export type SalarySlipStatus = 'Draft' | 'Processed' | 'Paid';

export interface SalarySlip {
  id: string;
  slipNumber: string;
  employeeId: string;
  month: string; // YYYY-MM
  monthLabel: string;
  workingDays: number;
  paidDays: number;
  paidLeavesUsed: number;
  lopDays: number;
  basic: number;
  hra: number;
  specialAllowance: number;
  conveyance: number;
  bonusAmount: number;
  grossEarnings: number;
  employeePf: number;
  employerPf: number;
  professionalTax: number;
  tds: number;
  lopDeduction: number;
  totalDeductions: number;
  netPay: number;
  status: SalarySlipStatus;
  sealRef: string;
  paidAt: string | null;
  generatedAt: string;
}

export type BonusType =
  | 'Performance Bonus'
  | 'Annual Appraisal'
  | 'Joining Bonus'
  | 'Spot Award'
  | 'Referral Bonus'
  | 'Festival Bonus';

export type BonusStatus = 'Pending' | 'Approved' | 'Credited' | 'Cancelled';

export interface BonusRecord {
  id: string;
  employeeId: string;
  bonusType: BonusType;
  amount: number;
  payoutMonth: string; // YYYY-MM
  reason: string;
  status: BonusStatus;
  approvedById: string | null;
  createdAt: string;
  creditedAt: string | null;
}

export interface PFAccount {
  id: string;
  employeeId: string;
  uan: string;
  pfAccountNumber: string;
  totalBalance: number;
  employeeShareTotal: number;
  employerShareTotal: number;
  vpfMonthly: number;
  interestRate: number;
  interestAccruedYtd: number;
  kycStatus: 'Verified' | 'Pending';
  nomineeName: string;
  status: 'Active' | 'Settled';
  updatedAt: string;
}

export interface PFTransaction {
  id: string;
  employeeId: string;
  month: string;
  type: 'Monthly Contribution' | 'VPF' | 'Interest Credit' | 'PF Advance';
  employeeContribution: number;
  employerContribution: number;
  totalAmount: number;
  balanceAfter: number;
  reference: string;
  createdAt: string;
}

export type RequestCategory =
  | 'Asset Request'
  | 'Attendance Regularization'
  | 'Expense Reimbursement'
  | 'PF Advance / KYC'
  | 'Salary Advance / Bonus'
  | 'HR Document / NOC'
  | 'Access Elevation'
  | 'General';

export type RequestPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type RequestStatus = 'Pending' | 'In Review' | 'Approved' | 'Rejected';

export interface OrgRequest {
  id: string;
  requestNumber: string;
  employeeId: string;
  category: RequestCategory;
  title: string;
  description: string;
  priority: RequestPriority;
  amount?: number;
  status: RequestStatus;
  reviewedById: string | null;
  reviewerNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

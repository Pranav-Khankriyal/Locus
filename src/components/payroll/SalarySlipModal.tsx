import { Printer, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { Employee, Organisation, PFAccount, SalarySlip, SalaryStructure } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { amountToWordsINR, formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

export function SalarySlipModal({
  slip,
  employee,
  organisation,
  structure,
  pfAccount,
  canManage,
  onMarkPaid,
  onClose,
}: {
  slip: SalarySlip;
  employee?: Employee;
  organisation?: Organisation | null;
  structure?: SalaryStructure;
  pfAccount?: PFAccount;
  canManage?: boolean;
  onMarkPaid?: (slipId: string) => Promise<void>;
  onClose: () => void;
}) {
  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=900,height=780');
    if (!win) {
      window.print();
      return;
    }
    const orgName = organisation?.name || 'Acme Corporation';
    win.document.write(`<!doctype html><html><head><title>${slip.slipNumber} - ${employee?.name || ''}</title>
      <style>
        body{font-family:system-ui,-apple-system,sans-serif;color:#111827;margin:32px;background:#fff}
        .box{border:1px solid #d1d5db;border-radius:12px;padding:28px;max-width:780px;margin:auto}
        .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #107C41;padding-bottom:16px;margin-bottom:20px}
        .title{font-size:22px;font-weight:800;margin:0}
        .muted{color:#6b7280;font-size:12px}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 24px;font-size:13px;margin-bottom:20px;background:#f9fafb;padding:14px;border-radius:8px}
        .row{display:flex;justify-content:space-between;border-bottom:1px dashed #e5e7eb;padding:4px 0}
        .cols{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}
        table{width:100%;border-collapse:collapse;font-size:13px}
        th{text-align:left;background:#f3f4f6;padding:8px 10px;font-size:11px;text-transform:uppercase;color:#374151}
        td{padding:8px 10px;border-bottom:1px solid #f3f4f6}
        td.num,th.num{text-align:right}
        .net{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;display:flex;justify-content:space-between;align-items:center}
        .net strong{font-size:20px;color:#107C41}
        .seal{margin-top:18px;font-size:11px;color:#4b5563;font-family:monospace;border-top:1px solid #e5e7eb;padding-top:12px;display:flex;justify-content:space-between}
      </style></head><body>
      <div class="box">
        <div class="head">
          <div><h1 class="title">${orgName}</h1><div class="muted">Payslip for ${slip.monthLabel}</div></div>
          <div style="text-align:right"><strong>${slip.slipNumber}</strong><div class="muted">Status: ${slip.status}</div></div>
        </div>
        <div class="grid">
          <div class="row"><span>Employee Name</span><strong>${employee?.name || slip.employeeId}</strong></div>
          <div class="row"><span>Employee Code</span><strong>${employee?.employeeId || '—'}</strong></div>
          <div class="row"><span>Designation</span><strong>${employee?.designation || '—'}</strong></div>
          <div class="row"><span>PAN</span><strong>${structure?.panNumber || '—'}</strong></div>
          <div class="row"><span>PF UAN</span><strong>${pfAccount?.uan || '—'}</strong></div>
          <div class="row"><span>Bank Account</span><strong>${structure ? `${structure.bankName} ···${structure.bankAccountLast4}` : '—'}</strong></div>
          <div class="row"><span>Paid Days / Working</span><strong>${slip.paidDays} / ${slip.workingDays} (Paid Leaves: ${slip.paidLeavesUsed})</strong></div>
          <div class="row"><span>Unpaid LOP Days</span><strong>${slip.lopDays}</strong></div>
        </div>
        <div class="cols">
          <table>
            <thead><tr><th>Earnings</th><th class="num">Amount</th></tr></thead>
            <tbody>
              <tr><td>Basic Salary</td><td class="num">${formatCurrency(slip.basic)}</td></tr>
              <tr><td>House Rent Allowance (HRA)</td><td class="num">${formatCurrency(slip.hra)}</td></tr>
              <tr><td>Special Allowance</td><td class="num">${formatCurrency(slip.specialAllowance)}</td></tr>
              <tr><td>Conveyance Allowance</td><td class="num">${formatCurrency(slip.conveyance)}</td></tr>
              ${slip.bonusAmount > 0 ? `<tr><td>Bonus &amp; Incentives</td><td class="num">${formatCurrency(slip.bonusAmount)}</td></tr>` : ''}
              <tr><th>Total Gross Earnings</th><th class="num">${formatCurrency(slip.grossEarnings)}</th></tr>
            </tbody>
          </table>
          <table>
            <thead><tr><th>Deductions</th><th class="num">Amount</th></tr></thead>
            <tbody>
              <tr><td>Employee PF Contribution (12%)</td><td class="num">${formatCurrency(slip.employeePf)}</td></tr>
              <tr><td>Professional Tax</td><td class="num">${formatCurrency(slip.professionalTax)}</td></tr>
              <tr><td>Income Tax (TDS)</td><td class="num">${formatCurrency(slip.tds)}</td></tr>
              ${slip.lopDeduction > 0 ? `<tr><td>Loss of Pay (LOP)</td><td class="num">${formatCurrency(slip.lopDeduction)}</td></tr>` : ''}
              <tr><th>Total Deductions</th><th class="num">${formatCurrency(slip.totalDeductions)}</th></tr>
            </tbody>
          </table>
        </div>
        <div class="net">
          <div><div class="muted">Net Salary Payable</div><div>${amountToWordsINR(slip.netPay)}</div></div>
          <strong>${formatCurrency(slip.netPay)}</strong>
        </div>
        <div class="seal">
          <span>Employer PF Contribution: ${formatCurrency(slip.employerPf)} (Credited to EPF)</span>
          <span>Seal: ${slip.sealRef}</span>
        </div>
      </div>
      <script>window.onload=function(){window.print()}</script></body></html>`);
    win.document.close();
  };

  return (
    <Modal wide title={`Salary Slip · ${slip.monthLabel}`} onClose={onClose}>
      <div className="modal-body space-y-4">
        {/* Org Header & Seal */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div>
            <p className="text-sm font-extrabold text-gray-900">{organisation?.name || 'Acme Corporation'}</p>
            <p className="text-[11px] text-gray-500 font-mono">{slip.slipNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge>{slip.status}</Badge>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-emerald-50 text-[#107C41] px-2 py-0.5 rounded-full border border-emerald-200/60">
              <ShieldCheck className="w-3 h-3" /> {slip.sealRef}
            </span>
          </div>
        </div>

        {/* Employee Meta & Attendance Days */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-xs">
          <div>
            <span className="text-[10px] text-gray-400 block">Employee</span>
            <strong className="text-gray-900">{employee?.name || slip.employeeId}</strong>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block">UAN / PAN</span>
            <strong className="text-gray-900 font-mono text-[11px]">
              {pfAccount?.uan || '—'} · {structure?.panNumber || '—'}
            </strong>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block">Paid / Working Days</span>
            <strong className="text-gray-900">
              {slip.paidDays} / {slip.workingDays} days
            </strong>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block">Paid Leaves · LOP</span>
            <strong className="text-gray-900">
              {slip.paidLeavesUsed} Paid · {slip.lopDays} LOP
            </strong>
          </div>
        </div>

        {/* Earnings & Deductions Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="bg-gray-50 px-3.5 py-2 border-b border-gray-200 flex justify-between text-[11px] font-bold text-gray-600 uppercase">
              <span>Earnings</span>
              <span>Amount</span>
            </div>
            <div className="p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Basic Salary</span>
                <span className="font-semibold text-gray-900">{formatCurrency(slip.basic)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">House Rent Allowance</span>
                <span className="font-semibold text-gray-900">{formatCurrency(slip.hra)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Special Allowance</span>
                <span className="font-semibold text-gray-900">{formatCurrency(slip.specialAllowance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Conveyance</span>
                <span className="font-semibold text-gray-900">{formatCurrency(slip.conveyance)}</span>
              </div>
              {slip.bonusAmount > 0 && (
                <div className="flex justify-between text-[#107C41]">
                  <span className="font-semibold">Bonus & Incentives</span>
                  <span className="font-bold">{formatCurrency(slip.bonusAmount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-100 font-bold text-gray-900">
                <span>Gross Earnings</span>
                <span>{formatCurrency(slip.grossEarnings)}</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="bg-gray-50 px-3.5 py-2 border-b border-gray-200 flex justify-between text-[11px] font-bold text-gray-600 uppercase">
              <span>Deductions</span>
              <span>Amount</span>
            </div>
            <div className="p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Employee PF (12%)</span>
                <span className="font-semibold text-gray-900">{formatCurrency(slip.employeePf)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Professional Tax</span>
                <span className="font-semibold text-gray-900">{formatCurrency(slip.professionalTax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Income Tax (TDS)</span>
                <span className="font-semibold text-gray-900">{formatCurrency(slip.tds)}</span>
              </div>
              {slip.lopDeduction > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Loss of Pay ({slip.lopDays}d)</span>
                  <span className="font-semibold">{formatCurrency(slip.lopDeduction)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-100 font-bold text-gray-900">
                <span>Total Deductions</span>
                <span>{formatCurrency(slip.totalDeductions)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-400 pt-1">
                <span>Employer EPF Match</span>
                <span>{formatCurrency(slip.employerPf)} / mo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Payable */}
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
              Net Pay Disbursable {slip.paidAt ? `· Paid ${formatDate(slip.paidAt)}` : ''}
            </span>
            <p className="text-xs text-emerald-800 mt-0.5">{amountToWordsINR(slip.netPay)}</p>
          </div>
          <span className="text-2xl font-semibold tabular-nums text-[#107C41]">{formatCurrency(slip.netPay)}</span>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          {canManage && slip.status !== 'Paid' && onMarkPaid && (
            <Button
              onClick={async () => {
                await onMarkPaid(slip.id);
              }}
            >
              <CheckCircle2 className="w-4 h-4" /> Mark as Paid & Post PF
            </Button>
          )}
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4" /> Print / Save PDF
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

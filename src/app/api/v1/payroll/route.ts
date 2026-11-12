import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organization_id');
  const employeeId = searchParams.get('employee_id');
  const month = searchParams.get('month');

  let structures = db.salary_structures;
  let slips = db.salary_slips;
  let bonuses = db.bonuses;
  let pfAccounts = db.pf_accounts;
  let pfTransactions = db.pf_transactions;

  if (organizationId) {
    structures = structures.filter((s) => s.organization_id === organizationId);
    slips = slips.filter((s) => s.organization_id === organizationId);
    bonuses = bonuses.filter((b) => b.organization_id === organizationId);
    pfAccounts = pfAccounts.filter((p) => p.organization_id === organizationId);
    pfTransactions = pfTransactions.filter((t) => t.organization_id === organizationId);
  }
  if (employeeId) {
    structures = structures.filter((s) => s.employee_id === employeeId);
    slips = slips.filter((s) => s.employee_id === employeeId);
    bonuses = bonuses.filter((b) => b.employee_id === employeeId);
    pfAccounts = pfAccounts.filter((p) => p.employee_id === employeeId);
    pfTransactions = pfTransactions.filter((t) => t.employee_id === employeeId);
  }
  if (month) {
    slips = slips.filter((s) => s.month === month);
  }

  slips = [...slips].sort((a, b) => b.month.localeCompare(a.month));

  return NextResponse.json({
    structures,
    slips,
    bonuses,
    pf_accounts: pfAccounts,
    pf_transactions: pfTransactions,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orgId = body.organization_id || db.organizations[0]?.id || '11111111-1111-1111-1111-111111111111';
    const action = body.action as string;
    const now = new Date().toISOString();

    if (action === 'update_structure') {
      const updated = db.upsertSalaryStructure({
        ...body.structure,
        organization_id: orgId,
        employee_id: body.employee_id || body.structure?.employee_id,
      });
      db.addAudit({
        id: `log-${Date.now()}`,
        organization_id: orgId,
        actor_user_id: body.actor_id || 'admin',
        action: 'SALARY_STRUCTURE_UPDATED',
        entity_type: 'Payroll',
        entity_id: updated.id,
        metadata: { employeeId: updated.employee_id, annualCtc: updated.annual_ctc },
        created_at: now,
      });
      return NextResponse.json(updated, { status: 200 });
    }

    if (action === 'generate_slips') {
      const month = body.month || new Date().toISOString().slice(0, 7);
      const slips = db.generateSalarySlips(orgId, month);
      db.addAudit({
        id: `log-${Date.now()}`,
        organization_id: orgId,
        actor_user_id: body.actor_id || 'admin',
        action: 'PAYROLL_BATCH_GENERATED',
        entity_type: 'Payroll',
        entity_id: month,
        metadata: { month, generatedCount: slips.length },
        created_at: now,
      });
      return NextResponse.json({ items: slips, month }, { status: 201 });
    }

    if (action === 'mark_paid') {
      const slip = db.markSlipPaid(body.slip_id);
      if (!slip) return NextResponse.json({ detail: 'Salary slip not found' }, { status: 404 });
      db.addAudit({
        id: `log-${Date.now()}`,
        organization_id: slip.organization_id,
        actor_user_id: body.actor_id || 'admin',
        action: 'SALARY_SLIP_DISBURSED',
        entity_type: 'Payroll',
        entity_id: slip.id,
        metadata: { employeeId: slip.employee_id, month: slip.month, netPay: slip.net_pay, sealRef: slip.seal_ref },
        created_at: now,
      });
      return NextResponse.json(slip, { status: 200 });
    }

    if (action === 'create_bonus') {
      const bonus = db.createBonus({
        organization_id: orgId,
        employee_id: body.employee_id,
        bonus_type: body.bonus_type || 'Performance Bonus',
        amount: Number(body.amount || 0),
        payout_month: body.payout_month || new Date().toISOString().slice(0, 7),
        reason: body.reason || 'Merit recognition',
        status: body.status || 'Approved',
        approved_by_id: body.status === 'Pending' ? null : (body.actor_id || 'e-1'),
      });
      db.addAudit({
        id: `log-${Date.now()}`,
        organization_id: orgId,
        actor_user_id: body.actor_id || 'admin',
        action: 'BONUS_AWARDED',
        entity_type: 'Bonus',
        entity_id: bonus.id,
        metadata: { employeeId: bonus.employee_id, amount: bonus.amount, type: bonus.bonus_type },
        created_at: now,
      });
      return NextResponse.json(bonus, { status: 201 });
    }

    if (action === 'update_bonus') {
      const bonus = db.updateBonusStatus(body.bonus_id, body.status, body.actor_id || 'e-1');
      if (!bonus) return NextResponse.json({ detail: 'Bonus record not found' }, { status: 404 });
      db.addAudit({
        id: `log-${Date.now()}`,
        organization_id: bonus.organization_id,
        actor_user_id: body.actor_id || 'admin',
        action: `BONUS_${String(body.status).toUpperCase()}`,
        entity_type: 'Bonus',
        entity_id: bonus.id,
        metadata: { employeeId: bonus.employee_id, amount: bonus.amount },
        created_at: now,
      });
      return NextResponse.json(bonus, { status: 200 });
    }

    if (action === 'update_pf') {
      const pf = db.updatePFAccount(body.employee_id, body.updates || {});
      if (!pf) return NextResponse.json({ detail: 'PF account not found' }, { status: 404 });
      db.addAudit({
        id: `log-${Date.now()}`,
        organization_id: pf.organization_id,
        actor_user_id: body.actor_id || 'admin',
        action: 'PF_ACCOUNT_UPDATED',
        entity_type: 'PF',
        entity_id: pf.id,
        metadata: { employeeId: pf.employee_id, uan: pf.uan },
        created_at: now,
      });
      return NextResponse.json(pf, { status: 200 });
    }

    if (action === 'pf_transaction') {
      const tx = db.addPFTransaction({
        organization_id: orgId,
        employee_id: body.employee_id,
        month: body.month || new Date().toISOString().slice(0, 7),
        type: body.type || 'VPF',
        employee_contribution: Number(body.employee_contribution || 0),
        employer_contribution: Number(body.employer_contribution || 0),
      });
      if (!tx) return NextResponse.json({ detail: 'PF account not found' }, { status: 404 });
      db.addAudit({
        id: `log-${Date.now()}`,
        organization_id: orgId,
        actor_user_id: body.actor_id || 'admin',
        action: 'PF_PASSBOOK_ENTRY_POSTED',
        entity_type: 'PF',
        entity_id: tx.id,
        metadata: { employeeId: tx.employee_id, type: tx.type, totalAmount: tx.total_amount },
        created_at: now,
      });
      return NextResponse.json(tx, { status: 201 });
    }

    return NextResponse.json({ detail: 'Unknown payroll action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { detail: error.message || 'Payroll operation failed' },
      { status: 500 }
    );
  }
}


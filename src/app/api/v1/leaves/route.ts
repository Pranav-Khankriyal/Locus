import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organization_id');
  const employeeId = searchParams.get('employee_id');
  const status = searchParams.get('status');

  let requests = db.leave_requests;
  let balances = db.leave_balances;
  let holidays = db.holidays;

  if (organizationId) {
    requests = requests.filter((r) => r.organization_id === organizationId);
    balances = balances.filter((b) => b.organization_id === organizationId);
    holidays = holidays.filter((h) => h.organization_id === organizationId);
  }
  if (employeeId) {
    requests = requests.filter((r) => r.employee_id === employeeId);
    balances = balances.filter((b) => b.employee_id === employeeId);
  }
  if (status) {
    requests = requests.filter((r) => r.status.toLowerCase() === status.toLowerCase());
  }

  return NextResponse.json({
    requests,
    balances,
    holidays,
    total: requests.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orgId = body.organization_id || db.organizations[0]?.id || '11111111-1111-1111-1111-111111111111';
    if (!body.employee_id || !body.start_date || !body.end_date) {
      return NextResponse.json(
        { detail: 'employee_id, start_date, and end_date are required' },
        { status: 400 }
      );
    }

    const start = new Date(body.start_date);
    const end = new Date(body.end_date);
    let days = Number(body.days) || 0;
    if (!days && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      let count = 0;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const day = d.getDay();
        if (day !== 0 && day !== 6) count++;
      }
      days = Math.max(1, count);
    }

    const leaveType = body.leave_type || 'Paid Leave';
    const record = db.createLeaveRequest({
      organization_id: orgId,
      employee_id: body.employee_id,
      leave_type: leaveType,
      start_date: body.start_date,
      end_date: body.end_date,
      days: days || 1,
      is_paid: leaveType !== 'Unpaid Leave',
      reason: body.reason || 'Personal leave request',
    });

    db.addAudit({
      id: `log-${Date.now()}`,
      organization_id: orgId,
      actor_user_id: body.employee_id,
      action: 'LEAVE_REQUEST_SUBMITTED',
      entity_type: 'Leave',
      entity_id: record.id,
      metadata: {
        leaveType: record.leave_type,
        days: record.days,
        isPaid: record.is_paid,
        startDate: record.start_date,
        endDate: record.end_date,
      },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { detail: error.message || 'Failed to submit leave request' },
      { status: 500 }
    );
  }
}


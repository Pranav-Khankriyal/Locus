import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organization_id');
  const employeeId = searchParams.get('employee_id');
  const date = searchParams.get('date');
  const status = searchParams.get('status');
  const month = searchParams.get('month');

  let items = db.attendance_records;
  if (organizationId) items = items.filter((a) => a.organization_id === organizationId);
  if (employeeId) items = items.filter((a) => a.employee_id === employeeId);
  if (date) items = items.filter((a) => a.date === date);
  if (month) items = items.filter((a) => a.date.startsWith(month));
  if (status) items = items.filter((a) => a.status.toLowerCase() === status.toLowerCase());

  items = [...items].sort((a, b) => b.date.localeCompare(a.date));

  return NextResponse.json({
    items,
    total: items.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orgId = body.organization_id || db.organizations[0]?.id || '11111111-1111-1111-1111-111111111111';
    const employeeId = body.employee_id;
    if (!employeeId) {
      return NextResponse.json({ detail: 'employee_id is required' }, { status: 400 });
    }
    const today = new Date().toISOString().slice(0, 10);
    const record = db.upsertAttendance({
      organization_id: orgId,
      employee_id: employeeId,
      date: body.date || today,
      action: body.action || 'mark',
      check_in: body.check_in,
      check_out: body.check_out,
      status: body.status,
      work_mode: body.work_mode,
      location: body.location,
      notes: body.notes,
    });

    db.addAudit({
      id: `log-${Date.now()}`,
      organization_id: orgId,
      actor_user_id: body.actor_id || employeeId,
      action:
        body.action === 'clock_in'
          ? 'ATTENDANCE_CLOCK_IN'
          : body.action === 'clock_out'
          ? 'ATTENDANCE_CLOCK_OUT'
          : 'ATTENDANCE_RECORD_UPDATED',
      entity_type: 'Attendance',
      entity_id: record.id,
      metadata: {
        employeeId: record.employee_id,
        date: record.date,
        status: record.status,
        workMode: record.work_mode,
      },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { detail: error.message || 'Failed to record attendance' },
      { status: 500 }
    );
  }
}


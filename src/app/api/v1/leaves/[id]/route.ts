import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const status = body.status as 'Approved' | 'Rejected' | 'Cancelled';
    if (!['Approved', 'Rejected', 'Cancelled'].includes(status)) {
      return NextResponse.json({ detail: 'Invalid leave status' }, { status: 400 });
    }

    const updated = db.reviewLeaveRequest(
      id,
      status,
      body.reviewer_id || 'e-1',
      body.reviewer_notes
    );
    if (!updated) {
      return NextResponse.json({ detail: 'Leave request not found' }, { status: 404 });
    }

    db.addAudit({
      id: `log-${Date.now()}`,
      organization_id: updated.organization_id,
      actor_user_id: body.reviewer_id || 'admin',
      action: `LEAVE_REQUEST_${status.toUpperCase()}`,
      entity_type: 'Leave',
      entity_id: updated.id,
      metadata: {
        employeeId: updated.employee_id,
        leaveType: updated.leave_type,
        days: updated.days,
        isPaid: updated.is_paid,
      },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { detail: error.message || 'Failed to update leave request' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  db.deleteLeaveRequest(id);
  return new NextResponse(null, { status: 204 });
}


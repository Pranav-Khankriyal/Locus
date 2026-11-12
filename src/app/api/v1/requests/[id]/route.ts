import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const status = body.status as 'Pending' | 'In Review' | 'Approved' | 'Rejected';
    if (!['Pending', 'In Review', 'Approved', 'Rejected'].includes(status)) {
      return NextResponse.json({ detail: 'Invalid request status' }, { status: 400 });
    }

    const updated = db.reviewOrgRequest(
      id,
      status,
      body.reviewer_id || 'e-1',
      body.reviewer_notes
    );
    if (!updated) {
      return NextResponse.json({ detail: 'Request not found' }, { status: 404 });
    }

    db.addAudit({
      id: `log-${Date.now()}`,
      organization_id: updated.organization_id,
      actor_user_id: body.reviewer_id || 'admin',
      action: `ORG_REQUEST_${status.replace(/\s+/g, '_').toUpperCase()}`,
      entity_type: 'Request',
      entity_id: updated.id,
      metadata: {
        requestNumber: updated.request_number,
        category: updated.category,
        status: updated.status,
      },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { detail: error.message || 'Failed to update request' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  db.deleteOrgRequest(id);
  return new NextResponse(null, { status: 204 });
}


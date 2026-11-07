import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { employee_id, notes } = await request.json();
    const asset = db.assets.find((a) => a.id === id);
    if (!asset) {
      return NextResponse.json({ detail: 'Asset not found' }, { status: 404 });
    }

    const prevEmployeeId = asset.current_employee_id;
    asset.current_employee_id = employee_id;
    asset.status = 'ASSIGNED';
    const now = new Date().toISOString();

    const tx = db.addTransaction({
      id: `tx-${Date.now()}`,
      asset_id: asset.id,
      transaction_type: 'ASSIGN',
      performed_by_user_id: 'admin',
      new_employee_id: employee_id,
      previous_employee_id: prevEmployeeId,
      notes: notes || 'Assigned to team member',
      created_at: now,
    });

    db.addAudit({
      id: `log-${Date.now()}`,
      organization_id: asset.organization_id,
      actor_user_id: 'admin',
      action: 'ASSET_ASSIGNED',
      entity_type: 'Asset',
      entity_id: asset.id,
      metadata: { employee_id, notes },
      created_at: now,
    });

    return NextResponse.json(tx, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message || 'Assignment failed' }, { status: 500 });
  }
}


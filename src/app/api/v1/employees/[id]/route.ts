import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const emp = db.employees.find((e) => e.id === id);
  if (!emp) {
    return NextResponse.json({ detail: 'Employee not found' }, { status: 404 });
  }
  return NextResponse.json(emp);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const updated = db.updateEmployee(id, body);
  if (!updated) {
    return NextResponse.json({ detail: 'Employee not found' }, { status: 404 });
  }

  db.addAudit({
    id: `log-${Date.now()}`,
    organization_id: updated.organization_id,
    actor_user_id: 'admin',
    action: 'EMPLOYEE_UPDATED',
    entity_type: 'Employee',
    entity_id: updated.id,
    metadata: { name: `${updated.first_name} ${updated.last_name}` },
    created_at: new Date().toISOString(),
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  db.deleteEmployee(id);
  return new NextResponse(null, { status: 204 });
}


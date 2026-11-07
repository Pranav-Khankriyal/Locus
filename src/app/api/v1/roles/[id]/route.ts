import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const role = db.roles.find((r) => r.id === id);
  if (!role) {
    return NextResponse.json({ detail: 'Role not found' }, { status: 404 });
  }
  return NextResponse.json(role);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const updated = db.updateRole(id, body);
  if (!updated) {
    return NextResponse.json({ detail: 'Role not found' }, { status: 404 });
  }

  db.addAudit({
    id: `log-${Date.now()}`,
    organization_id: updated.organization_id,
    actor_user_id: 'admin',
    action: 'ROLE_UPDATED',
    entity_type: 'Role',
    entity_id: updated.id,
    metadata: { name: updated.name },
    created_at: new Date().toISOString(),
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  db.deleteRole(id);
  return new NextResponse(null, { status: 204 });
}


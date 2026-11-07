import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organization_id');

  let list = db.roles;
  if (organizationId) {
    list = list.filter((r) => r.organization_id === organizationId);
  }
  return NextResponse.json({
    items: list,
    total: list.length,
  });
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const body = await request.json();
    const orgId = searchParams.get('organization_id') || body.organization_id || db.organizations[0]?.id || 'org-1';
    const id = `r-${Date.now()}`;
    const now = new Date().toISOString();

    const role = db.addRole({
      id,
      organization_id: orgId,
      name: body.name,
      description: body.description || '',
      is_system: false,
      permissions: body.permissions || [],
      created_at: now,
    });

    db.addAudit({
      id: `log-${Date.now()}`,
      organization_id: orgId,
      actor_user_id: 'admin',
      action: 'ROLE_CREATED',
      entity_type: 'Role',
      entity_id: role.id,
      metadata: { name: role.name },
      created_at: now,
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message || 'Failed to create role' }, { status: 500 });
  }
}


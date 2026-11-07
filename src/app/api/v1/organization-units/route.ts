import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organization_id');

  let list = db.units;
  if (organizationId) {
    list = list.filter((u) => u.organization_id === organizationId);
  }
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = `u-${Date.now()}`;
    const now = new Date().toISOString();

    const unit = db.addUnit({
      id,
      organization_id: body.organization_id || db.organizations[0]?.id || 'org-1',
      name: body.name,
      unit_type: body.unit_type || 'department',
      parent_unit_id: body.parent_unit_id || null,
      created_at: now,
    });

    db.addAudit({
      id: `log-${Date.now()}`,
      organization_id: unit.organization_id,
      actor_user_id: 'admin',
      action: 'ORGANISATION_UNIT_CREATED',
      entity_type: 'Organisation',
      entity_id: unit.id,
      metadata: { name: unit.name, type: unit.unit_type },
      created_at: now,
    });

    return NextResponse.json(unit, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message || 'Failed to create unit' }, { status: 500 });
  }
}


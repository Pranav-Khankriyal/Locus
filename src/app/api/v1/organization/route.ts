import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  return NextResponse.json({
    organizations: db.organizations,
    total: db.organizations.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = `org-${Date.now()}`;
    const code = body.code || body.name.toUpperCase().replace(/[^A-Z0-9]+/g, '-').slice(0, 20);
    const now = new Date().toISOString();

    const newOrg = db.addOrganization({
      id,
      name: body.name,
      code,
      description: body.description || `${body.name} Organization workspace on Lokus.`,
      created_at: now,
    });

    // Create root organization unit
    db.addUnit({
      id: `u-${Date.now()}`,
      organization_id: id,
      name: 'General Headquarters',
      unit_type: 'division',
      parent_unit_id: null,
      created_at: now,
    });

    // Audit log
    db.addAudit({
      id: `log-${Date.now()}`,
      organization_id: id,
      actor_user_id: 'admin',
      action: 'ORGANISATION_CREATED',
      entity_type: 'Organisation',
      entity_id: id,
      metadata: { name: body.name, code },
      created_at: now,
    });

    return NextResponse.json(newOrg, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message || 'Failed to create organization' }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organization_id');
  const org = db.organizations.find((o) => o.id === organizationId) || db.organizations[0];
  if (!org) {
    return NextResponse.json({ detail: 'Organization not found' }, { status: 404 });
  }
  const ownerUser = db.users.find((u) => u.id === org.owner_user_id);
  return NextResponse.json({
    companyCode: org.code,
    ownerEmail: ownerUser?.email || null,
    coAdminEmails: org.co_admin_emails || [],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orgId = body.organization_id || db.organizations[0]?.id;
    const emails: string[] = Array.isArray(body.co_admin_emails) ? body.co_admin_emails : [];
    const updated = db.setOrganizationCoAdmins(orgId, emails);
    if (!updated) {
      return NextResponse.json({ detail: 'Organization not found' }, { status: 404 });
    }

    db.addAudit({
      id: `log-${Date.now()}`,
      organization_id: orgId,
      actor_user_id: updated.owner_user_id || 'admin',
      action: 'CO_ADMINS_UPDATED',
      entity_type: 'Organisation',
      entity_id: orgId,
      metadata: { coAdminEmails: (updated.co_admin_emails || []).join(', ') || 'None' },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      coAdminEmails: updated.co_admin_emails || [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update co-admins';
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}


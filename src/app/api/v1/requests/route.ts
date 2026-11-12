import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organization_id');
  const employeeId = searchParams.get('employee_id');
  const category = searchParams.get('category');
  const status = searchParams.get('status');

  let items = db.org_requests;
  if (organizationId) items = items.filter((r) => r.organization_id === organizationId);
  if (employeeId) items = items.filter((r) => r.employee_id === employeeId);
  if (category) items = items.filter((r) => r.category.toLowerCase() === category.toLowerCase());
  if (status) items = items.filter((r) => r.status.toLowerCase() === status.toLowerCase());

  return NextResponse.json({
    items,
    total: items.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orgId = body.organization_id || db.organizations[0]?.id || '11111111-1111-1111-1111-111111111111';
    if (!body.employee_id || !body.title) {
      return NextResponse.json({ detail: 'employee_id and title are required' }, { status: 400 });
    }

    const record = db.createOrgRequest({
      organization_id: orgId,
      employee_id: body.employee_id,
      category: body.category || 'General',
      title: body.title,
      description: body.description || '',
      priority: body.priority || 'Medium',
      amount: body.amount !== undefined && body.amount !== '' ? Number(body.amount) : undefined,
    });

    db.addAudit({
      id: `log-${Date.now()}`,
      organization_id: orgId,
      actor_user_id: body.employee_id,
      action: 'ORG_REQUEST_CREATED',
      entity_type: 'Request',
      entity_id: record.id,
      metadata: {
        requestNumber: record.request_number,
        category: record.category,
        priority: record.priority,
      },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { detail: error.message || 'Failed to submit request' },
      { status: 500 }
    );
  }
}


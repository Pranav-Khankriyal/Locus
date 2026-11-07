import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organization_id');
  const action = searchParams.get('action');
  const entityType = searchParams.get('entity_type');
  const entityId = searchParams.get('entity_id');

  let list = db.audit_logs;
  if (organizationId) {
    list = list.filter((l) => l.organization_id === organizationId);
  }
  if (action) {
    list = list.filter((l) => l.action.toLowerCase().includes(action.toLowerCase()));
  }
  if (entityType) {
    list = list.filter((l) => l.entity_type.toLowerCase() === entityType.toLowerCase());
  }
  if (entityId) {
    list = list.filter((l) => l.entity_id === entityId);
  }

  return NextResponse.json({
    items: list,
    total: list.length,
  });
}


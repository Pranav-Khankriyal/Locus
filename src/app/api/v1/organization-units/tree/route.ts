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


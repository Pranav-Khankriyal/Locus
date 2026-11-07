import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organization_id');

  let list = db.categories;
  if (organizationId) {
    list = list.filter((c) => c.organization_id === organizationId);
  }
  return NextResponse.json({
    items: list,
    total: list.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = `c-${Date.now()}`;
    const newCat = {
      id,
      organization_id: body.organization_id || db.organizations[0]?.id || 'org-1',
      name: body.name,
      type: body.type || 'Physical',
      parent_category_id: body.parent_category_id || null,
      created_at: new Date().toISOString(),
    };
    db.categories.push(newCat);
    return NextResponse.json(newCat, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message || 'Failed to create category' }, { status: 500 });
  }
}


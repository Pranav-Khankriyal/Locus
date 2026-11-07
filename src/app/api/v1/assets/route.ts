import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organization_id');
  const search = searchParams.get('search')?.toLowerCase();
  const status = searchParams.get('status')?.toUpperCase();
  const categoryId = searchParams.get('category_id');

  let list = db.assets;
  if (organizationId) {
    list = list.filter((a) => a.organization_id === organizationId);
  }
  if (status) {
    list = list.filter((a) => a.status === status);
  }
  if (categoryId) {
    list = list.filter((a) => a.asset_category_id === categoryId);
  }
  if (search) {
    list = list.filter(
      (a) =>
        a.name.toLowerCase().includes(search) ||
        a.asset_code.toLowerCase().includes(search) ||
        a.serial_number?.toLowerCase().includes(search) ||
        a.description?.toLowerCase().includes(search)
    );
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
    const id = `a-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const orgId = searchParams.get('organization_id') || body.organization_id || db.organizations[0]?.id || 'org-1';
    const now = new Date().toISOString();

    const category = db.categories.find((c) => c.id === body.asset_category_id);
    const assetType = category?.type || (body.name.toLowerCase().includes('certificate') || body.name.toLowerCase().includes('key') ? 'Digital' : 'Physical');

    const asset = db.addAsset({
      id,
      organization_id: orgId,
      asset_category_id: body.asset_category_id || db.categories[0]?.id || 'c-1',
      asset_code: body.asset_code || `AST-${Date.now().toString().slice(-4)}`,
      name: body.name,
      description: body.description || '',
      asset_type: assetType,
      serial_number: body.serial_number || '',
      location: body.location || '',
      condition: body.metadata?.condition || body.condition || 'Good',
      status: body.status || 'AVAILABLE',
      current_employee_id: null,
      integrity_status: 'Verified',
      integrity_seal_ref: null,
      canonical_hash: null,
      metadata: body.metadata || {},
      created_at: now,
    });

    db.addAudit({
      id: `log-${Date.now()}`,
      organization_id: orgId,
      actor_user_id: 'admin',
      action: 'ASSET_CREATED',
      entity_type: 'Asset',
      entity_id: asset.id,
      metadata: { name: asset.name, code: asset.asset_code },
      created_at: now,
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message || 'Failed to create asset' }, { status: 500 });
  }
}


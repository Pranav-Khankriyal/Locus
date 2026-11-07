import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organization_id');

  let list = db.integrity_seals;
  if (organizationId) {
    list = list.filter((s) => s.organization_id === organizationId);
  }

  const formatted = list.map((s) => ({
    id: s.id,
    organization_id: s.organization_id,
    transaction_hash: s.seal_ref,
    record_key: s.record_key,
    record_hash: s.record_hash,
    status: 'CONFIRMED',
    created_at: s.sealed_at,
    block_number: 1000 + Math.floor(Math.random() * 50),
    entity_type: s.entity_type,
    entity_id: s.entity_id,
  }));

  return NextResponse.json({
    items: formatted,
    total: formatted.length,
  });
}


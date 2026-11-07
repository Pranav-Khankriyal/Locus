import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const seal = db.integrity_seals.find((s) => s.id === id || s.seal_ref === id);
  if (!seal) {
    return NextResponse.json({ detail: 'Transaction seal not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: seal.id,
    organization_id: seal.organization_id,
    transaction_hash: seal.seal_ref,
    record_key: seal.record_key,
    record_hash: seal.record_hash,
    status: 'CONFIRMED',
    created_at: seal.sealed_at,
    block_number: 1042,
    entity_type: seal.entity_type,
    entity_id: seal.entity_id,
  });
}


import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = db.verifyEntity('Asset', id);

  return NextResponse.json({
    blockchain_verified: result.verified,
    transaction_id: result.transactionRef,
    verified_at: result.checkedAt,
    message: result.message,
    record: result.record,
    name: result.name,
  });
}


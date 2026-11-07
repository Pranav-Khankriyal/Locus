import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  const { employeeId } = await params;
  const result = db.verifyEntity('Identity', employeeId);

  return NextResponse.json({
    blockchain_verified: result.verified,
    verified: result.verified,
    transaction_id: result.transactionRef,
    verified_at: result.checkedAt,
    message: result.message,
    record: result.record,
    name: result.name,
  });
}


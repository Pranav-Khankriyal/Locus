import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { kind, id } = await request.json();
    const entityType = kind === 'Identity' ? 'Identity' : 'Asset';
    const result = db.verifyEntity(entityType, id);

    return NextResponse.json({
      verified: result.verified,
      kind: entityType,
      name: result.name,
      id,
      record: result.record,
      message: result.message,
      transaction_id: result.transactionRef,
      verified_at: result.checkedAt,
    });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message || 'Verification failed' }, { status: 500 });
  }
}


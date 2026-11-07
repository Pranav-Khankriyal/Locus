import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { employee_id } = await request.json();
    if (!employee_id) {
      return NextResponse.json({ detail: 'employee_id is required' }, { status: 400 });
    }

    const seal = db.sealEntity('Identity', employee_id);
    return NextResponse.json({
      status: 'CONFIRMED',
      transaction_id: seal.seal_ref,
      record_key: seal.record_key,
      record_hash: seal.record_hash,
      anchored_at: seal.sealed_at,
      message: 'Cryptographic identity seal issued and confirmed.',
    });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message || 'Sealing failed' }, { status: 500 });
  }
}


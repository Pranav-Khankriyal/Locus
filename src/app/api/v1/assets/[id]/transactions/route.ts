import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const list = db.transactions.filter((t) => t.asset_id === id);
  return NextResponse.json({
    items: list,
    total: list.length,
  });
}


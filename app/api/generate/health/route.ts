import { NextResponse } from 'next/server';
import { getGenerationHealth } from '@/lib/generation-service';

export function GET() {
  const health = getGenerationHealth();

  return NextResponse.json(
    health,
    { status: health.configured ? 200 : 503 }
  );
}

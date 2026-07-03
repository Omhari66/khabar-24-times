import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Don't cache health checks

export async function GET() {
  try {
    const startTime = performance.now();
    // Test DB connection with a lightweight query
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = performance.now() - startTime;

    return NextResponse.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: 'OK',
          latencyMs: Math.round(dbLatency),
        }
      },
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error('[Health Check Failed]', error);
    return NextResponse.json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: 'ERROR',
          error: error instanceof Error ? error.message : 'Unknown DB Error'
        }
      }
    }, { status: 503 });
  }
}

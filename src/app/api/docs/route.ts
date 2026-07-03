import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const swaggerPath = path.join(process.cwd(), 'docs', 'swagger.json');
    const fileContents = fs.readFileSync(swaggerPath, 'utf8');
    return new NextResponse(fileContents, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Docs API Error]', error);
    return NextResponse.json({ error: 'Swagger documentation not found' }, { status: 404 });
  }
}

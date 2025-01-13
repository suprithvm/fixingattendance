import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { corsMiddleware } from '@/lib/cors';

export async function GET(request: NextRequest) {
  try {
    const headers = await corsMiddleware(request);
    const client = await clientPromise;
    await client.db('attendance_system').command({ ping: 1 });
    
    return NextResponse.json({ message: 'Database connection successful' }, { headers });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { message: 'Database connection failed', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: await corsMiddleware(request) }
    );
  }
} 
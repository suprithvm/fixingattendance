import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { corsMiddleware } from '@/lib/cors';

export async function POST(request: NextRequest) {
  try {
    const response = await corsMiddleware(request, NextResponse.next());
    const { companyName, duration } = await request.json();

    if (!companyName || !duration) {
      return NextResponse.json(
        { message: 'Company name and duration are required' }, 
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('attendance_system');

    // First deactivate any active sessions
    try {
      await db.collection('attendanceSessions').updateMany(
        { isActive: true },
        { $set: { isActive: false, endTime: new Date() } }
      );
    } catch (error) {
      console.error('Error deactivating existing sessions:', error);
      // Continue execution even if this fails
    }

    // Create new session
    const session = {
      companyName,
      duration: Number(duration),
      startTime: new Date(),
      endTime: new Date(Date.now() + Number(duration) * 60000),
      isActive: true
    };

    try {
      const result = await db.collection('attendanceSessions').insertOne(session);
      
      if (!result.insertedId) {
        throw new Error('Failed to insert new session');
      }

      return NextResponse.json({ 
        message: 'Attendance window opened', 
        session: { ...session, _id: result.insertedId } 
      });
      
    } catch (error) {
      console.error('Error inserting new session:', error);
      throw new Error('Failed to create new attendance session');
    }

  } catch (error) {
    console.error('Error in startAttendance:', error);
    return NextResponse.json(
      { 
        message: 'Error starting attendance', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}
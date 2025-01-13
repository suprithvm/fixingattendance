import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { corsMiddleware } from '@/lib/cors';
import { getIO } from '@/lib/socketio';

export async function GET(request: NextRequest) {
  const headers = await corsMiddleware(request);

  try {
    const client = await clientPromise;
    const db = client.db('attendance_system');

    const latestSession = await db.collection('attendanceSessions')
      .findOne({}, { sort: { startTime: -1 } });

    if (!latestSession) {
      return NextResponse.json(
        { message: 'No attendance sessions found' }, 
        { status: 404, headers }
      );
    }

    // Check if session has expired
    const sessionDuration = latestSession.duration || 3600; // Default 1 hour if not specified
    const sessionEndTime = new Date(latestSession.startTime.getTime() + sessionDuration * 1000);
    
    if (new Date() > sessionEndTime) {
      // Update session status to completed
      await db.collection('attendanceSessions').updateOne(
        { _id: latestSession._id },
        { $set: { status: 'completed' } }
      );
      
      // Emit session ended event
      const io = getIO();
      io.emit('sessionEnded', { sessionId: latestSession._id });

      return NextResponse.json(
        { message: 'Session has ended' },
        { status: 400, headers }
      );
    }

    const attendanceList = await db.collection('attendance')
      .find({ sessionId: latestSession._id })
      .toArray();

    return NextResponse.json(
      { 
        session: latestSession, 
        attendanceList,
        remainingTime: Math.max(0, sessionEndTime.getTime() - new Date().getTime()) / 1000
      }, 
      { headers }
    );
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { message: 'Error fetching attendance' }, 
      { status: 500, headers }
    );
  }
}
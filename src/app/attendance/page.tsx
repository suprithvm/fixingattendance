'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const socket = useSocket();

  const fetchAttendance = async () => {
    try {
      const response = await fetch('/api/getAttendance');
      const data = await response.json();
      
      if (response.ok) {
        setAttendanceData(data);
        setRemainingTime(data.remainingTime);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  useEffect(() => {
    fetchAttendance();

    // Set up Socket.IO event listeners
    if (socket) {
      socket.on('attendanceUpdate', (data) => {
        setAttendanceData(prev => ({
          ...prev,
          attendanceList: data.attendanceList
        }));
      });

      socket.on('sessionEnded', () => {
        // Handle session end
        setRemainingTime(0);
        // You might want to show a message or redirect
      });
    }

    // Update remaining time every second
    const timer = setInterval(() => {
      setRemainingTime(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearInterval(timer);
      if (socket) {
        socket.off('attendanceUpdate');
        socket.off('sessionEnded');
      }
    };
  }, [socket]);

  // Format remaining time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Render your attendance data and remaining time
  return (
    <div>
      {remainingTime > 0 ? (
        <div>Session Time Remaining: {formatTime(remainingTime)}</div>
      ) : (
        <div>Session has ended</div>
      )}
      {/* Rest of your attendance display code */}
    </div>
  );
} 
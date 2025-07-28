import { Request, Response } from 'express';

import EmployeeStatus from '../enum/EmployeeStatus';
import Attendance from '../models/AttendanceModel';

// Mark Attendance (Check-in)
const checkIn = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const date = new Date().toISOString().split('T')[0];
  const timeIn = new Date().toISOString();

  console.log('Clock-in request:', { userId, date, timeIn });

  const existingRecord = await Attendance.findOne({ userId, date });

  if (existingRecord) {
    return res.status(400).json({ error: 'Already clocked in today' });
  }

  await Attendance.create({
    userId,
    date,
    timeIn,
    status: EmployeeStatus.Present,
  });

  res.json({ message: 'Clock-in successful' });
};

// Mark Attendance (Check-out)
const checkOut = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const date = new Date().toISOString().split('T')[0];
  const timeOut = new Date().toISOString();
  console.log('Check-out request:', { userId, date, timeOut });

  const attendance = await Attendance.findOne({ userId, date });
  if (!attendance) {
    return res.status(400).json({ error: 'Clock-in required first' });
  }
  if (attendance.timeOut) {
    return res.status(400).json({ error: 'Already clocked out today' });
  }
  attendance.timeOut = timeOut;
  await attendance.save();
  res.json({ message: 'Clock-out successful' });
};

// Get Attendance Records with Filters
const getAttendanceRecords = async (req: Request, res: Response) => {
  const { userId, startDate, endDate } = req.query;

  const filter: any = {};

  // Default to one month of data if no date range is provided
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);

  filter.date = {
    $gte: startDate || oneMonthAgo.toISOString().split('T')[0],
    $lte: endDate || now.toISOString().split('T')[0],
  };

  if (userId) {
    filter.userId = userId;
  }
  console.log('Attendance filter:', filter);
  try {
    const attendanceRecords = await Attendance.find(filter)
      .sort({ date: -1 })
      .populate('userId', 'firstName lastName email');
    res.json({ attendanceRecords });
  } catch (error) {
    console.error('Error fetching filtered attendance records:', error);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
};

export { checkIn, checkOut, getAttendanceRecords };

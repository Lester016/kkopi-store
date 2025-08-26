import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Request, Response } from 'express';

import EmployeeStatus from '../enum/EmployeeStatus';
import Attendance from '../models/AttendanceModel';
import s3 from '../utils/aws.config';
import { handleImageUpload } from '../utils/imageHandler';

// Mark Attendance (Check-in)
const checkIn = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const date = new Date().toISOString().split('T')[0];
    const existingRecord = await Attendance.findOne({ userId, date });
    if (existingRecord) {
      return res.status(400).json({ error: 'Already clocked in today' });
    }

    // File upload + validation
    const { imagePath } = await handleImageUpload(req.file, userId);
    const timeIn = new Date().toISOString();
    console.log('Check-in request:', { userId, date, timeIn });

    await Attendance.create({
      userId,
      date,
      timeIn: timeIn,
      status: EmployeeStatus.Present,
      selfieIn: imagePath,
    });

    return res.json({ message: 'Clock-in successful' });
  } catch (err: any) {
    console.error('Clock-in error:', err);
    return res.status(400).json({ error: err.message || 'Clock-in failed' });
  }
};
// Mark Attendance (Check-out)
const checkOut = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const date = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOne({ userId, date });
    if (!attendance)
      return res.status(400).json({ error: 'Clock-in required first' });
    if (attendance.timeOut)
      return res.status(400).json({ error: 'Already clocked out today' });

    let timeOut = new Date().toISOString();
    console.log('Check-out request:', { userId, date, timeOut });
    const { imagePath } = await handleImageUpload(req.file, userId);

    const diff =
      new Date(timeOut).getTime() - new Date(attendance.timeIn).getTime();

    attendance.totalHours = Math.round(diff / (1000 * 60 * 60));
    attendance.selfieOut = imagePath;
    attendance.status = EmployeeStatus.Present;
    attendance.timeOut = timeOut;

    await attendance.save();
    res.json({ message: 'Clock-out successful' });
  } catch (err: any) {
    console.error('Error during clock-out:', err);
    res.status(500).json({ error: err.message || 'Failed to clock out' });
  }
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

    const recordsWithUrls = await Promise.all(
      attendanceRecords.map(async (record: any) => {
        const obj = record.toObject();

        if (obj.selfieIn) {
          const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: obj.selfieIn,
          });
          obj.selfieIn = await getSignedUrl(s3, command, {
            expiresIn: 3600,
          });
        }

        if (obj.selfieOut) {
          const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: obj.selfieOut,
          });
          obj.selfieOut = await getSignedUrl(s3, command, {
            expiresIn: 3600,
          });
        }

        return obj;
      })
    );

    res.json({ recordsWithUrls });
  } catch (error) {
    console.error('Error fetching filtered attendance records:', error);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
};

export { checkIn, checkOut, getAttendanceRecords };

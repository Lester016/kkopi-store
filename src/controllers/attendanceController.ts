// @ts-expect-error no types available
import exifParser from 'exif-parser';
import { Request, Response } from 'express';

import EmployeeStatus from '../enum/EmployeeStatus';
import Attendance from '../models/AttendanceModel';

// Multer setup for in-memory storage (no persistent disk storage for now)

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
  let imageUrl: string | null = null;
  let imageTakenAt: string | null = null;

  if (req.file) {
    console.log('Image uploaded:', req.file.originalname);

    // Extract EXIF metadata
    try {
      const parser = exifParser.create(req.file.buffer);
      const result = parser.parse();

      if (result.tags.DateTimeOriginal) {
        // Convert from EXIF timestamp to ISO string
        imageTakenAt = new Date(
          result.tags.DateTimeOriginal * 1000
        ).toISOString();
      }

      console.log('Extracted EXIF metadata:', {
        imageTakenAt,
        cameraModel: result.tags.Model,
        make: result.tags.Make,
      });
    } catch (metaError) {
      console.warn('Failed to parse EXIF metadata:', metaError);
    }

    // --- S3 integration example (commented out) ---
    /*
      import AWS from 'aws-sdk';
      const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
      });

      const s3Params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: `attendance/${userId}-${Date.now()}.jpg`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        ACL: 'public-read',
      };

      const uploadResult = await s3.upload(s3Params).promise();
      imageUrl = uploadResult.Location;
      */
  }
  if (existingRecord) {
    return res.status(400).json({ error: 'Already clocked in today' });
  }

  await Attendance.create({
    userId,
    date,
    timeIn,
    status: EmployeeStatus.Present,
    selfieIn: imageTakenAt ? imageTakenAt : null,
  });

  res.json({ message: 'Clock-in successful' });
};

// Mark Attendance (Check-out)
const checkOut = async (req: Request, res: Response) => {
  try {
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
    // Calculate total hours worked
    if (attendance.timeIn) {
      const diffTimeInMS =
        new Date(timeOut).getTime() - new Date(attendance.timeIn).getTime();
      attendance.totalHours = Math.round(diffTimeInMS / (1000 * 60 * 60)); // Convert milliseconds to hours
    }
    attendance.status = EmployeeStatus.Present; // Update status to Present on clock-out
    await attendance.save();
    res.json({ message: 'Clock-out successful' });
  } catch (error) {
    console.error('Error during clock-out:', error);
    res.status(500).json({ error: 'Failed to clock out' });
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
    res.json({ attendanceRecords });
  } catch (error) {
    console.error('Error fetching filtered attendance records:', error);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
};

export { checkIn, checkOut, getAttendanceRecords };

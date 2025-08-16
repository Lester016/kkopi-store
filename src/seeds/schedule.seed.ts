import mongoose from 'mongoose';
import ScheduleModel from '../models/ScheduleModel';
import User from '../models/UserModel';
import connectDB from '../utils/connectToDb';

const defaultWeeklySchedule = {
  Monday: { shiftStart: '09:00', shiftEnd: '17:00' },
  Tuesday: { shiftStart: '09:00', shiftEnd: '17:00' },
  Wednesday: { shiftStart: '09:00', shiftEnd: '17:00' },
  Thursday: { shiftStart: '09:00', shiftEnd: '17:00' },
  Friday: { shiftStart: '09:00', shiftEnd: '17:00' },
  Saturday: { shiftStart: null, shiftEnd: null },
  Sunday: { shiftStart: null, shiftEnd: null },
};

async function seedSchedules() {
  try {
    connectDB();

    await ScheduleModel.deleteMany({});
    console.log('Cleared existing schedules');

    const employees = await User.find({ role: 'EMPLOYEE' });
    console.log(`Seeding schedules for ${employees.length} employees...`);

    if (employees.length === 0) {
      console.log('⚠️ No employees found, aborting.');
      return;
    }

    const schedules = employees.map((employee) => ({
      userId: employee._id,
      weeklySchedule: defaultWeeklySchedule,
    }));

    await ScheduleModel.insertMany(schedules);
    console.log('✅ Employee schedules seeded successfully.');
  } catch (err) {
    console.error('❌ Error seeding schedules:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedSchedules();

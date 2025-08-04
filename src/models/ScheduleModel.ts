import mongoose, { Document, Schema, model } from 'mongoose';

export interface ISchedule extends Document {
  userId: object;
  weeklySchedule: {
    Monday?: { shiftStart?: string; shiftEnd?: string };
    Tuesday?: { shiftStart?: string; shiftEnd?: string };
    Wednesday?: { shiftStart?: string; shiftEnd?: string };
    Thursday?: { shiftStart?: string; shiftEnd?: string };
    Friday?: { shiftStart?: string; shiftEnd?: string };
    Saturday?: { shiftStart?: string; shiftEnd?: string };
    Sunday?: { shiftStart?: string; shiftEnd?: string };
  };
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema = new Schema<ISchedule>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // enforce 1 schedule per user
    },
    weeklySchedule: {
      Monday: {
        shiftStart: { type: String, required: false },
        shiftEnd: { type: String, required: false },
      },
      Tuesday: {
        shiftStart: { type: String, required: false },
        shiftEnd: { type: String, required: false },
      },
      Wednesday: {
        shiftStart: { type: String, required: false },
        shiftEnd: { type: String, required: false },
      },
      Thursday: {
        shiftStart: { type: String, required: false },
        shiftEnd: { type: String, required: false },
      },
      Friday: {
        shiftStart: { type: String, required: false },
        shiftEnd: { type: String, required: false },
      },
      Saturday: {
        shiftStart: { type: String, required: false },
        shiftEnd: { type: String, required: false },
      },
      Sunday: {
        shiftStart: { type: String, required: false },
        shiftEnd: { type: String, required: false },
      },
    },
  },
  { timestamps: true }
);

export default model<ISchedule>('Schedule', ScheduleSchema);

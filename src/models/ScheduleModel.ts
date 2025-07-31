import mongoose, { Document, Schema, model } from 'mongoose';

export interface ISchedule extends Document {
  userId: object;
  dayOfWeek: string; // 0 (Sunday) - 6 (Saturday)
  shiftStart: string; // 'HH:mm' format
  shiftEnd: string; // 'HH:mm' format
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema = new Schema<ISchedule>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dayOfWeek: {
      type: String,
      required: true,
      enum: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ],
    },
    shiftStart: { type: String, required: true }, // e.g. '08:00'
    shiftEnd: { type: String, required: true }, // e.g. '17:00'
  },
  { timestamps: true }
);

export default model<ISchedule>('Schedule', ScheduleSchema);

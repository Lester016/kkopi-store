import mongoose, { Document, Schema, model } from 'mongoose';
import EmployeeStatus from '../enum/EmployeeStatus';

interface Attendance extends Document {
  userId: object;
  date: string;
  timeIn: string;
  timeOut: string;
  status: string;
  totalHours: number;
  selfieIn?: string;
  selfieOut?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const AttendanceSchema = new Schema<Attendance>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: { type: String, required: true },
    timeIn: { type: String, default: null },
    timeOut: { type: String, default: null },
    selfieIn: { type: String },
    selfieOut: { type: String },
    status: {
      type: String,
      required: true,
      enum: EmployeeStatus,
    },
    totalHours: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const AttendanceModel = model<Attendance>('Attendance', AttendanceSchema);

export default AttendanceModel;

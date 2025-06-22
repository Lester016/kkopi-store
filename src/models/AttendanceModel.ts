import mongoose, { Document, Schema, model } from 'mongoose';
import EmployeeStatus from '../enum/EmployeeStatus';

interface Attendance extends Document {
  userId: object;
  date: string;
  timeIn: string;
  timeOut: string;
  status: string;
}

const AttendanceSchema = new Schema<Attendance>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: { type: String, required: true },
  timeIn: { type: String, default: null },
  timeOut: { type: String, default: null },
  status: {
    type: String,
    required: true,
    enum: EmployeeStatus,
  },
});

const AttendanceModel = model<Attendance>('Attendance', AttendanceSchema);

export default AttendanceModel;

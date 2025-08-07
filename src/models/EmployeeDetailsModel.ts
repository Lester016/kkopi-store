import mongoose, { model } from 'mongoose';

interface EmployeeDetails {
  user: mongoose.Schema.Types.ObjectId;
  employeeId?: string; // Optional, unique identifier for the employee
  position?: string;
  branch?: string;
  startDate?: Date;
  phone?: string;
}

const EmployeeDetailsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true, // Required to avoid unique-index errors on null
  },
  position: {
    type: String,
  },
  branch: {
    type: String,
  },
  startDate: {
    type: Date,
  },
  phone: {
    type: String,
  },
});

const EmployeeDetailsModel = model<EmployeeDetails>(
  'EmployeeDetails',
  EmployeeDetailsSchema
);

export default EmployeeDetailsModel;

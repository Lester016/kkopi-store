import { Request, RequestHandler, Response } from 'express';
import mongoose from 'mongoose';
import CounterModel from '../models/CounterModel';
import EmployeeDetailsModel, {
  EmployeeDetails,
} from '../models/EmployeeDetailsModel';
import Schedule from '../models/ScheduleModel';
import User from '../models/UserModel';

const getAllUsers = async (req: Request, res: Response) => {
  const usersWithDetails = await User.find(
    { role: { $ne: 'ADMIN' }, deletedAt: null },
    'firstName lastName email createdAt updatedAt role'
  )
    .populate({
      path: 'employeeDetails', // matches the ref in EmployeeDetails
      select: 'employeeId position branch startDate phone', // fields from EmployeeDetails
    })
    .populate('schedule');

  res.send({ employees: usersWithDetails });
};

const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      console.error('Invalid user ID:', id);
      return res.status(400).send({ message: 'Invalid user ID' });
    }

    const user = await User.findById(
      id,
      'firstName lastName email createdAt updatedAt'
    ).populate({
      path: 'employeeDetails', // matches the ref in EmployeeDetails
      select: 'employeeId position branch startDate phone', // fields from EmployeeDetails
    });

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    res.send({ user });
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).send({ message: 'Error retrieving user', error });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      email,
      firstName,
      lastName,
      password,
      // employeeDetails
      position,
      branch,
      startDate,
      phone,
    } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Check if email is being updated and ensure uniqueness
    if (email && email !== user.email) {
      const emailInUse = await User.findOne({
        email: email,
        _id: { $ne: id },
      }).lean();
      if (emailInUse) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    let employeeDetails: EmployeeDetails | null =
      await EmployeeDetailsModel.findOne({ user: id });

    if (position || branch || startDate || phone) {
      if (employeeDetails) {
        // Update existing employee details
        employeeDetails = await EmployeeDetailsModel.findOneAndUpdate(
          { user: id },
          { position, branch, startDate, phone },
          { new: true, runValidators: true }
        );
      } else {
        // Create new employee details with generated ID
        const employeeId = await getNextEmployeeId();
        employeeDetails = await EmployeeDetailsModel.findOneAndUpdate(
          { user: id },
          { employeeId, position, branch, startDate, phone },
          { new: true, upsert: true, runValidators: true }
        );
      }
    }

    Object.assign(user, {
      email,
      firstName,
      lastName,
      password: password ? password : user.password, // only update password if provided
    }); // apply updates to user instance
    await user.save(); // save with validation
    user.employeeDetails = employeeDetails; // attach employee details if updated

    // Sanitize response: pick only whitelisted fields
    const sanitizedUser = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      employeeDetails: employeeDetails
        ? {
            employeeId: employeeDetails.employeeId,
            position: employeeDetails.position,
            branch: employeeDetails.branch,
            startDate: employeeDetails.startDate,
            phone: employeeDetails.phone,
          }
        : null,
    };

    res.send({
      message: 'User updated successfully',
      user: sanitizedUser,
    });
  } catch (error) {
    res.status(500).send({ message: 'Error updating user', error });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    if (user.deletedAt) {
      return res
        .status(400)
        .send({ message: 'User already marked as deleted' });
    }

    // Mark as deleted
    user.deletedAt = new Date();
    await user.save();

    res.send({ message: 'User deleted successfully', user });
  } catch (error) {
    res.status(500).send({ message: 'Error marking user as deleted', error });
  }
};

const getUserSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send({ message: 'Invalid user ID' });
    }
    const schedule = await Schedule.findOne({ userId: id });

    res.send({ schedule: schedule ? schedule.weeklySchedule : null });
  } catch (error) {
    console.error('Error retrieving user schedule:', error);
    res.status(500).send({ message: 'Error retrieving user schedule', error });
  }
};

const updateSchedule = async (req: Request, res: Response) => {
  try {
    const employeeId = req.params.id as string;
    const { schedule } = req.body;

    if (!mongoose.isValidObjectId(employeeId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await User.findById(employeeId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (typeof schedule !== 'object' || Array.isArray(schedule) || !schedule) {
      return res.status(400).json({ error: 'Invalid schedule format' });
    }

    // Validate keys and structure
    const validDays = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];

    const weeklySchedule: Record<
      string,
      { shiftStart?: string; shiftEnd?: string }
    > = {};

    for (const day of validDays) {
      if (schedule[day]) {
        const { start_time, end_time } = schedule[day];

        if (typeof start_time !== 'string' || typeof end_time !== 'string') {
          return res
            .status(400)
            .json({ error: `Invalid time format for ${day}` });
        }

        weeklySchedule[day] = {
          shiftStart: start_time,
          shiftEnd: end_time,
        };
      } else {
        // If day is missing, treat as off-day
        weeklySchedule[day] = {};
      }
    }

    const updated = await Schedule.findOneAndUpdate(
      { userId: employeeId },
      { userId: employeeId, weeklySchedule },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Schedule updated successfully',
      data: {
        userId: employeeId,
        schedule: updated.weeklySchedule,
      },
    });
  } catch (err) {
    console.error('Error updating schedule:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get next sequence value
async function getNextEmployeeId() {
  const result = await CounterModel.findByIdAndUpdate(
    { _id: 'employee_id' },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return result.sequence_value.toString().padStart(6, '0');
}

const addEmployeeDetails: RequestHandler = async (req, res) => {
  const { position, branch, startDate, phone } = req.body;

  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).send({ error: 'Invalid user ID' });
    }

    const [existingDetails, user] = await Promise.all([
      EmployeeDetailsModel.findOne({ user: id }),
      User.findById(id),
    ]);

    if (existingDetails) {
      return res.status(400).send({ error: 'Employee details already exist' });
    }

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    const employeeId = await getNextEmployeeId();
    const employeeDetails = await EmployeeDetailsModel.create({
      user: id,
      employeeId,
      position,
      branch,
      startDate,
      phone,
    });

    res.status(201).send({
      message: 'Employee details added successfully',
      employeeDetails,
    });
  } catch (error) {
    console.error('Error adding employee details:', error);
    res.status(500).send({ error: 'Error adding employee details' });
  }
};

// const verifyEmail = async (req: Request, res: Response) => {
//   res.send({ message: `Email sent to , please verify.` });
// };

export {
  addEmployeeDetails,
  deleteUser,
  getAllUsers,
  getUser,
  getUserSchedule,
  updateSchedule,
  updateUser,
};

// seeds/user.seed.ts
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import EmployeeStatus from '../src/enum/EmployeeStatus';
import Role from '../src/enum/Role';
import AttendanceModel from '../src/models/AttendanceModel';
import EmployeeDetailsModel from '../src/models/EmployeeDetailsModel';
import User from '../src/models/UserModel';

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to MongoDB');

    // Clear collections
    await User.deleteMany({});
    await EmployeeDetailsModel.deleteMany({});
    await AttendanceModel.deleteMany({});
    console.log('Cleared existing collections');

    const usersData = [
      {
        email: 'admin1@example.com',
        firstName: 'Admin',
        lastName: 'One',
        password: 'password123',
        role: Role.Admin,
        verified: true,
      },
      {
        email: 'admin2@example.com',
        firstName: 'Admin',
        lastName: 'Two',
        password: 'password123',
        role: Role.Admin,
        verified: true,
      },
      {
        email: 'employee1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
        role: Role.Employee,
        verified: true,
      },
      {
        email: 'employee2@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        password: 'password123',
        role: Role.Employee,
        verified: false,
      },
      {
        email: 'employee3@example.com',
        firstName: 'Mark',
        lastName: 'Taylor',
        password: 'password123',
        role: Role.Employee,
        verified: true,
      },
      {
        email: 'employee4@example.com',
        firstName: 'Sara',
        lastName: 'Lee',
        password: 'password123',
        role: Role.Employee,
        verified: true,
      },
      {
        email: 'employee5@example.com',
        firstName: 'Alex',
        lastName: 'Johnson',
        password: 'password123',
        role: Role.Employee,
        verified: false,
      },
      {
        email: 'employee6@example.com',
        firstName: 'Emily',
        lastName: 'Davis',
        password: 'password123',
        role: Role.Employee,
        verified: true,
      },
      {
        email: 'employee7@example.com',
        firstName: 'Chris',
        lastName: 'Brown',
        password: 'password123',
        role: Role.Employee,
        verified: true,
      },
      {
        email: 'employee8@example.com',
        firstName: 'Pat',
        lastName: 'Wilson',
        password: 'password123',
        role: Role.Employee,
        verified: false,
      },
    ];

    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1); // 1st day of last month
    const daysInLastMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    ).getDate();

    for (const [index, userData] of usersData.entries()) {
      const user = new User(userData);
      await user.save();

      if (user.role === Role.Employee) {
        // Create EmployeeDetails
        const employeeDetails = new EmployeeDetailsModel({
          user: user._id,
          employeeId: `EMP-${String(index).padStart(4, '0')}`,
          position: 'Staff',
          branch: `Branch ${index}`,
          startDate: new Date('2023-01-01'),
          phone: `+6391234567${index}`,
        });
        await employeeDetails.save();

        // Populate attendance for last month
        for (let day = 1; day <= daysInLastMonth; day++) {
          const dateStr = new Date(
            lastMonth.getFullYear(),
            lastMonth.getMonth(),
            day
          )
            .toISOString()
            .split('T')[0]; // YYYY-MM-DD format

          // Random status: Present (70%), Absent (20%), Late (10%)
          const rand = Math.random();
          let status = EmployeeStatus.Present;
          if (rand < 0.2) status = EmployeeStatus.Absent;
          else if (rand < 0.3) status = EmployeeStatus.Late;

          let timeIn = null;
          let timeOut = null;
          let totalHours = 0;

          if (
            status === EmployeeStatus.Present ||
            status === EmployeeStatus.Late
          ) {
            const inHour = status === EmployeeStatus.Late ? 10 : 9;
            timeIn = `${String(inHour).padStart(2, '0')}:00`;
            timeOut = '17:00';
            totalHours = 8;
          }

          const attendance = new AttendanceModel({
            userId: user._id,
            date: dateStr,
            timeIn,
            timeOut,
            selfieIn: 'https://example.com/selfie-in.jpg',
            selfieOut: 'https://example.com/selfie-out.jpg',
            status,
            totalHours,
          });

          await attendance.save();
        }
      }
    }

    console.log('Users, employee details, and attendance seeded successfully');
    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error seeding:', error);
    process.exit(1);
  }
};

seedUsers();

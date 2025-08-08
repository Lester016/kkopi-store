import bcrypt from 'bcrypt';
import { model, Schema } from 'mongoose';
import { nanoid } from 'nanoid';
import Role from '../enum/Role';

// 1. Create an interface representing a document in MongoDB.
interface User {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
  passwordResetCode?: string | null;
  verificationCode: string | null;
  verified: boolean;
  matchPassword: (password: string) => Promise<boolean>;
  [key: string]: any;
}
// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<User>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Role,
      default: Role.Employee,
    },
    passwordResetCode: {
      type: String,
    },
    verificationCode: {
      type: String,
      default: () => nanoid(),
    },
    verified: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.virtual('employeeDetails', {
  ref: 'EmployeeDetails', // Model name
  localField: '_id', // Field in User
  foreignField: 'user', // Field in EmployeeDetails
  justOne: true, // Each user has one employee details
});

userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  let isValid = await bcrypt.compare(enteredPassword, this.password); // We can get items by using this because we called the schema
  return isValid;
};

// Middleware pre will execute before save.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  // salt is required to hash something
  const salt = await bcrypt.genSalt(10); // value could be added to env!
  this.password = await bcrypt.hash(this.password, salt);
});

// 3. Create a Model.
const User = model<User>('User', userSchema);

export default User;

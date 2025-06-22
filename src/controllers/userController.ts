import { Request, Response } from 'express';
import User from '../models/UserModel';

const getAllUsers = async (req: Request, res: Response) => {
  const users = await User.find(
    {},
    'firstName lastName email createdAt updatedAt'
  );
  res.send({ users });
};

const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(
      id,
      'firstName lastName email createdAt updatedAt'
    );

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    res.send({ user });
  } catch (error) {
    res.status(500).send({ message: 'Error retrieving user', error });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const user = await User.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    res.send({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).send({ message: 'Error updating user', error });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    if (user.deletedAt) {
      return res
        .status(400)
        .send({ message: 'User already marked as deleted' });
    }

    res.send({ message: 'User deleted successfully', user });
  } catch (error) {
    res.status(500).send({ message: 'Error marking user as deleted', error });
  }
};

// const verifyEmail = async (req: Request, res: Response) => {
//   res.send({ message: `Email sent to , please verify.` });
// };

export { deleteUser, getAllUsers, getUser, updateUser };

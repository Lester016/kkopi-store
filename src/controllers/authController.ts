import { Request, RequestHandler, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import jwt, { JwtPayload } from 'jsonwebtoken';

import { config } from '../config/config';
import Role from '../enum/Role';
import User from '../models/UserModel';
import generateToken from '../utils/generateToken';
import { sendEmailVerification } from '../utils/sendEmailVerification';

const authUser = async (
  req: Request /* We can annotate using this<{}, {}, IUser>*/,
  res: Response
) => {
  const { email, password }: User = req.body; // or like this.

  const user = await User.findOne({ email: email, deletedAt: null });
  if (user && (await user.matchPassword(password))) {
    // Create JWT here.

    const { access, refresh } = await generateToken(user);

    // res.cookie("access", access, { maxAge: 24 * 60 * 60 * 1000 /*one day*/ }); optional if we don't want to send this as a response.data
    res.send({ access, refresh });
  } else {
    // Either way is fine. But if we want to return to the client we use .send() method.
    res.status(403).send({ error: 'Invalid Email and Password.' });
  }
};

// We don't need to wrap this with `expressAsyncHandler`, if we are not throwing any errors.
// Also useful to end the function.
const registerUser = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body as User; // We can also annotate like this.

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).send({ message: 'User already exists!' });
  }
  // Create user in database
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
  });

  // // Send email verifiation here.
  // const verificationLink = `http://localhost:5000/api/verify?token=${user.verificationCode}`;
  // sendEmailVerification(user.id, verificationLink);

  // status response 201 means something is created.
  res.status(201).send({
    message: `User ${user.firstName} is successfully created`,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });
};

const verifyUser: RequestHandler = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(403).send({ message: 'Token required!' });
  }

  const user = await User.findOne({ verificationCode: token });
  if (!user) {
    return res.status(400).send({ error: 'Token Invalid' });
  }

  user.verified = true;
  user.verificationCode = null;
  await user.save();

  res.status(200).send({ success: 'You are now verified!' });
};

const refreshToken = async (req: Request, res: Response) => {
  const { refresh } = req.body;

  if (!refresh) {
    return res.status(401).send({ error: 'Refresh token is required' });
  }

  try {
    // Verify refresh token.
    const decoded = jwt.verify(
      refresh,
      config.refreshTokenPrivateKey
    ) as JwtPayload;
    console.log(decoded, refresh, config.refreshTokenPrivateKey);
    const user = await User.findOne({ _id: decoded.user.id, deletedAt: null });
    if (!user) {
      console.log('User not found, Invalid Token');
      return res.status(404).send({ error: 'Invalid Token' });
    }
    // Generate new access token.
    const newToken = await generateToken(user);

    res.send({ access: newToken.access, refresh: newToken.refresh });
  } catch (error) {
    return res.status(400).send({ error: 'Invalid Token' });
  }
};

export { authUser, refreshToken, registerUser, verifyUser };

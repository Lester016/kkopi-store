import jwt from 'jsonwebtoken';

import { config } from '../config/config';
import Token from '../models/TokenModel';
import User from '../models/UserModel';

const generateToken = async (
  user: User
  //   options?: jwt.SignOptions | undefined
) => {
  const access = jwt.sign(
    {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        verified: user.verified,
      },
    },
    config.accessTokenPrivateKey,
    {
      expiresIn: config.accessTokenExpire,
      // algorithm: "RS256", must be assymetric with private key format.
    }
  );
  const refresh = jwt.sign(
    { user: { id: user.id } },
    config.refreshTokenPrivateKey,
    {
      expiresIn: config.refreshTokenExpire,
    }
  );

  const userToken = await Token.findOne({ userId: user.id });
  // Remove if existing.
  if (userToken) {
    await userToken.remove();
  }

  // Replace a new one.
  await Token.create({ userId: user.id, token: refresh });

  return { access, refresh };
};

export default generateToken;

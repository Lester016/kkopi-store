import jwt from "jsonwebtoken";

import { config } from "../config/config";
import Token from "../models/TokenModel";

const generateToken = async (
  id: string
  //   options?: jwt.SignOptions | undefined
) => {
  const access = jwt.sign({ id }, config.accessTokenPrivateKey, {
    expiresIn: config.accessTokenExpire,
    // algorithm: "RS256", must be assymetric with private key format.
  });

  const refresh = jwt.sign({ id }, config.refreshTokenPrivateKey, {
    expiresIn: config.refreshTokenExpire,
  });

  const userToken = await Token.findOne({ userId: id });
  // Remove if existing.
  if (userToken) {
    await userToken.remove();
  }

  // Replace a new one.
  await Token.create({ userId: id, token: refresh });

  return { access, refresh };
};

export default generateToken;

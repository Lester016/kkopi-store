import jwt from "jsonwebtoken";

import asyncHandler from "express-async-handler"; // returns the error via json
import { config } from "../config/config.js";
import { NextFunction, Request, Response } from "express";

const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1]; // get the token.

        // verifying the token here.
        const decoded = jwt.verify(token, config.accessTokenPrivateKey);

        // fetch user data remove hashed password to queries.
        req.user = decoded;
        console.log("Decoded Token Data", decoded);

        next();
      } catch (error) {
        console.error(error);
        res.status(401).send({ error: "Not authorized, Invalid token" });
      }
    }

    if (!token) {
      res.status(401).send({ error: "Not authorized, no token found" }); // Unauthorized
    }
  }
);

export { protect };

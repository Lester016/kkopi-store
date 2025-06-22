import { NextFunction, Request, Response } from "express";

import log from "../utils/logger";

export const logger = (req: Request, res: Response, next: NextFunction) => {
  res.on("finish", () => {
    log.info(
      `${req.method} ${decodeURI(req.url)} ${res.statusCode} ${
        res.statusMessage
      }`
    );
  });

  next();
};

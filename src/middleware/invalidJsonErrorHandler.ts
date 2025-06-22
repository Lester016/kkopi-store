import { NextFunction, Request, Response } from 'express';

// ...existing middleware and routes...

// Error handler for invalid JSON
const invalidJsonErrorHandler = (
  err: { status: any },
  _: any,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next(err);
};

export default invalidJsonErrorHandler;

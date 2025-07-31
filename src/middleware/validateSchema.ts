import { NextFunction, Request, Response } from 'express';
import Joi, { ObjectSchema } from 'joi';

import User from '../models/UserModel';

export const validateSchema = (schema: ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.body, { abortEarly: false });
      next();
    } catch (error: any) {
      res.status(422).send(error.details);
    }
  };
};

export const LoginSchema = Joi.object<User>({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const RegisterSchema = Joi.object<User>({
  email: Joi.string().email().required(),
  firstName: Joi.string().uppercase().required(),
  lastName: Joi.string().required(),
  password: Joi.string().required(),
  confirmPassword: Joi.ref('password'),
});

export const UpdateUserSchema = Joi.object<User>({
  email: Joi.string().email(),
  firstName: Joi.string().uppercase(),
  lastName: Joi.string(),
}).min(1);

export const UpdateScheduleSchema = Joi.object({
  schedule: Joi.array()
    .items(
      Joi.object({
        day_of_week: Joi.string()
          .valid(
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
          )
          .required(),

        start_time: Joi.string()
          .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/) // 'HH:mm'
          .required(),

        end_time: Joi.string()
          .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
          .required(),
      })
    )
    .min(1)
    .required(),
});

import { NextFunction, Request, Response } from 'express';
import Joi, { ObjectSchema } from 'joi';

import mongoose from 'mongoose';
import User from '../models/UserModel';

export const validateSchema = (schema: ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.body, { abortEarly: true });
      next();
    } catch (error: any) {
      const firstError = error.details?.[0];

      const cleanedField = firstError.path.join('.');
      const rawMessage = firstError.message;

      // Remove leading/trailing quotes from field name in message
      const cleanedMessage = rawMessage.replace(
        /^"(.+)" is/,
        (_: string, field: string) => {
          // Optional: transform field name to human readable (PascalCase, etc.)
          const friendlyField: string = field
            .split('.')
            .slice(-2)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          return `${friendlyField} is`;
        }
      );

      return res.status(422).json({
        field: cleanedField,
        message: cleanedMessage,
      });
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
  lastName: Joi.string().uppercase(),
  password: Joi.string().optional(),
  position: Joi.string().optional(),
  branch: Joi.string().optional(),
  startDate: Joi.date().optional(),
  phone: Joi.string()
    .pattern(/^[0-9+\-\s()]*$/)
    .optional(),
}).min(1);

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const UpdateScheduleSchema = Joi.object({
  schedule: Joi.object({
    Monday: Joi.object({
      start_time: Joi.string().pattern(timePattern),
      end_time: Joi.string().pattern(timePattern),
    }),
    Tuesday: Joi.object({
      start_time: Joi.string().pattern(timePattern),
      end_time: Joi.string().pattern(timePattern),
    }),
    Wednesday: Joi.object({
      start_time: Joi.string().pattern(timePattern),
      end_time: Joi.string().pattern(timePattern),
    }),
    Thursday: Joi.object({
      start_time: Joi.string().pattern(timePattern),
      end_time: Joi.string().pattern(timePattern),
    }),
    Friday: Joi.object({
      start_time: Joi.string().pattern(timePattern),
      end_time: Joi.string().pattern(timePattern),
    }),
    Saturday: Joi.object({
      start_time: Joi.string().pattern(timePattern),
      end_time: Joi.string().pattern(timePattern),
    }),
    Sunday: Joi.object({
      start_time: Joi.string().pattern(timePattern),
      end_time: Joi.string().pattern(timePattern),
    }),
  })
    .required()
    .min(1),
});

export const AddEmployeeDetailsSchema = Joi.object({
  position: Joi.string().optional(),
  branch: Joi.string().optional(),
  startDate: Joi.date().optional(),
  phone: Joi.string()
    .pattern(/^[0-9+\-\s()]*$/)
    .optional(),
});

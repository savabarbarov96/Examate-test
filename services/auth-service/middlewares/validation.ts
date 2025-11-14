import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { BadRequestError } from '../utils/ApiError.js';

export const validate = (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return next(new BadRequestError(error.details[0].message));
  }
  next();
};

export const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

export const verify2faSchema = Joi.object({
  twoFACode: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const changePasswordSchema = Joi.object({
  userId: Joi.string().required(),
  newPassword: Joi.string().required(),
});

export const sendActivationOrResetPassLinkSchema = Joi.object({
  email: Joi.string().email().required(),
  purpose: Joi.string().valid('activation', 'reset-password'),
});

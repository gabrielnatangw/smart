import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().max(100).required().messages({
    'string.email': 'Please provide a valid email address',
    'string.max': 'Email cannot exceed 100 characters',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.max': 'Password cannot exceed 100 characters',
    'any.required': 'Password is required',
  }),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required',
  }),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().max(100).required().messages({
    'string.email': 'Please provide a valid email address',
    'string.max': 'Email cannot exceed 100 characters',
    'any.required': 'Email is required',
  }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required',
  }),
  newPassword: Joi.string().min(6).max(100).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.max': 'Password cannot exceed 100 characters',
    'any.required': 'New password is required',
  }),
});

export const firstLoginSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Access token is required',
  }),
  newPassword: Joi.string().min(6).max(100).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.max': 'Password cannot exceed 100 characters',
    'any.required': 'New password is required',
  }),
});

export function validateRequest(
  schema: Joi.ObjectSchema,
  data: any
): { error: string | null; value: any } {
  const { error, value } = schema.validate(data, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return { error: errorMessage, value: null };
  }

  return { error: null, value };
}

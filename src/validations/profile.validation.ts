import Joi from 'joi';

export const profileValidation = {
  updateProfile: Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    currentPassword: Joi.string().when('newPassword', {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    newPassword: Joi.string().min(8).optional(),
  }),
}; 
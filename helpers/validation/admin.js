const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

// Validation for admin
exports.validateUser = (User) => {
  const schema = Joi.object({
    walletAddress: Joi.string().max(40).required().messages({
      'string.empty': 'First name is required',
    }),

    name: Joi.string().max(50).required().messages({
      'string.empty': 'Last name is required',
    }),
    email: Joi.string().required().messages({
        'string.empty': 'Phone Number is required'})

  }).options({ allowUnknown: true });
  return schema.validate(User);
};

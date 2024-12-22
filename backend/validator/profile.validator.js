import Joi from "joi";

//Profile validation schema
export const validateProfile = (data) => {
  const schema = Joi.object({
    bio: Joi.string().max(200).allow("").messages({
      "string.base": "Bio must be a string.",
      "string.max": "Bio must not exceed 200 characters.",
    }),
    avatar: Joi.string().uri().allow("").messages({
      "string.base": "Avatar must be a string.",
      "string.uri": "Avatar must be a valid URL.",
    }),
    location: Joi.string().max(50).allow("").messages({
      "string.base": "Location must be a string.",
      "string.max": "Location must not exceed 50 characters.",
    }),
  });

  const { error } = schema.validate(data, { abortEarly: false }); // Capture all errors
  const errors = error
    ? error.details.reduce((acc, curr) => {
        acc[curr.path[0]] = curr.message; // Map each error to its field
        return acc;
      }, {})
    : {};

  return { errors, isValid: !error }; // Return errors and isValid
};

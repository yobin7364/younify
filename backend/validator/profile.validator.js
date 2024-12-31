import Joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/; // Define the pattern for ObjectId validation

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
    visibility: Joi.string().valid("public", "private").required().messages({
      "any.only": 'Visibility must be either "public" or "private".',
      "string.base": "Visibility must be a string.",
      "any.required": "Visibility is required.",
    }),
    followers: Joi.array()
      .items(
        Joi.string()
          .pattern(objectIdPattern) // Use pattern validation for ObjectId
          .message("Each follower ID must be a valid ObjectId (24 characters)")
      )
      .default([])
      .messages({
        "array.base": "Followers must be an array of ObjectId strings.",
        "string.pattern.base":
          "Each follower ID must be a valid ObjectId (24 hexadecimal characters).",
      }),

    following: Joi.array()
      .items(
        Joi.string()
          .pattern(objectIdPattern) // Use pattern validation for ObjectId
          .message("Each following ID must be a valid ObjectId (24 characters)")
      )
      .default([])
      .messages({
        "array.base": "Following must be an array of ObjectId strings.",
        "string.pattern.base":
          "Each following ID must be a valid ObjectId (24 hexadecimal characters).",
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

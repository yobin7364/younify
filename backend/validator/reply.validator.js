import Joi from "joi";

// Define the ObjectId pattern for validation
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

// Reply validation schema
export const validateReply = (data) => {
  const schema = Joi.object({
    user: Joi.string()
      .pattern(objectIdPattern) // Ensure user ID is a valid ObjectId
      .required()
      .messages({
        "string.base": "User ID must be a string.",
        "string.pattern.base":
          "User ID must be a valid ObjectId (24 hexadecimal characters).",
        "any.required": "User ID is required.",
      }),

    content: Joi.string().required().messages({
      "string.base": "Content must be a string.",
      "any.required": "Content is required.",
    }),

    likes: Joi.number().integer().min(0).default(0).messages({
      "number.base": "Likes must be a number.",
      "number.integer": "Likes must be an integer.",
      "number.min": "Likes cannot be less than 0.",
    }),

    mentions: Joi.array()
      .items(
        Joi.string()
          .pattern(objectIdPattern) // Ensure mention IDs are valid ObjectIds
          .message("Each mention ID must be a valid ObjectId (24 characters)")
      )
      .default([])
      .messages({
        "array.base": "Mentions must be an array of ObjectId strings.",
        "string.pattern.base":
          "Each mention ID must be a valid ObjectId (24 hexadecimal characters).",
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

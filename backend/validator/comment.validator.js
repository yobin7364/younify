import Joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

// Post validation schema
export const validateComment = (data) => {
  const schema = Joi.object({
    postId: Joi.string()
      .required()
      .pattern(objectIdPattern) // Use the variable for the pattern
      .messages({
        "string.base": "Post ID must be a string.",
        "string.pattern.base":
          "Post ID must be a valid ObjectId (24 hexadecimal characters).",
        "any.required": "Post ID is required.",
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
          .pattern(objectIdPattern) // Use the variable for the pattern
          .message("Each mention ID must be a valid ObjectId (24 characters)")
      )
      .default([])
      .messages({
        "array.base": "Mentions must be an array of ObjectId strings.",
        "string.pattern.base":
          "Each mention ID must be a valid ObjectId (24 hexadecimal characters).",
      }),

    replies: Joi.array()
      .items(
        Joi.string()
          .pattern(objectIdPattern) // Use the variable for the pattern
          .message("Each reply ID must be a valid ObjectId (24 characters)")
      )
      .default([])
      .messages({
        "array.base": "Replies must be an array of ObjectId strings.",
        "string.pattern.base":
          "Each reply ID must be a valid ObjectId (24 hexadecimal characters).",
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

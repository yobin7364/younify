import Joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/; // Define the pattern for ObjectId validation

// Post validation schema
export const validatePost = (data) => {
  const schema = Joi.object({
    title: Joi.string().max(200).required().messages({
      "string.base": "Title must be a string.",
      "string.max": "Title must not exceed 200 characters.",
      "any.required": "Title is required.",
    }),

    content: Joi.string().required().messages({
      "string.base": "Content must be a string.",
      "any.required": "Content is required.",
    }),

    author: Joi.string()
      .pattern(objectIdPattern) // Use pattern validation for ObjectId
      .required()
      .messages({
        "string.base": "Author ID must be a string.",
        "string.pattern.base":
          "Author ID must be a valid ObjectId (24 hexadecimal characters).",
        "any.required": "Author is required.",
      }),

    media: Joi.array()
      .items(Joi.string().uri().message("Each media URL must be a valid URI"))
      .default([])
      .messages({
        "array.base": "Media must be an array.",
      }),

    hashTags: Joi.array()
      .items(
        Joi.string().regex(/^#\w+/).message("Each hashtag must start with a #")
      )
      .default([])
      .messages({
        "array.base": "Hashtags must be an array of strings.",
        "string.pattern.base": "Each hashtag must start with a # symbol.",
      }),

    mentions: Joi.array()
      .items(
        Joi.string()
          .pattern(objectIdPattern) // Use pattern validation for ObjectId
          .message("Each mention ID must be a valid ObjectId (24 characters)")
      )
      .default([])
      .messages({
        "array.base": "Mentions must be an array of ObjectId strings.",
        "string.pattern.base":
          "Each mention ID must be a valid ObjectId (24 hexadecimal characters).",
      }),

    likes: Joi.number().integer().min(0).default(0).messages({
      "number.base": "Likes must be a number.",
      "number.integer": "Likes must be an integer.",
      "number.min": "Likes cannot be less than 0.",
    }),

    comments: Joi.array()
      .items(
        Joi.string()
          .pattern(objectIdPattern) // Use pattern validation for ObjectId
          .message("Each comment ID must be a valid ObjectId (24 characters)")
      )
      .default([])
      .messages({
        "array.base": "Comments must be an array of ObjectId strings.",
        "string.pattern.base":
          "Each comment ID must be a valid ObjectId (24 hexadecimal characters).",
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

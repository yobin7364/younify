import mongoose from "mongoose";
const { Schema } = mongoose;

// Post Schema
const PostSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 200, // Maximum title length
    },
    content: {
      type: String,
      required: true, // Content is required
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", // Links to the User model, users is collection
      required: true, // Author is required
    },
    media: {
      type: [String], // Array of URLs for images/videos
      default: [],
    },
    tags: {
      type: [String], // Array of tags
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now, // Automatically set to the current date/time
    },
    updatedAt: {
      type: Date,
      default: Date.now, // Automatically set to the current date/time
    },
    likes: {
      type: Number,
      default: 0, // Default likes count is 0
    },
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, // User who commented
        content: { type: String, required: true }, // Comment content
        likes: {
          type: Number,
          default: 0, // Default likes for comment
        },
        replies: [
          {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, // Reply author
            content: { type: String, required: true }, // Reply content
            likes: {
              type: Number,
              default: 0, // Default likes for reply
            },
            createdAt: { type: Date, default: Date.now }, // Timestamp for reply
          },
        ],
        createdAt: { type: Date, default: Date.now }, // Timestamp for comment
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create a Post model from the schema
const Post = mongoose.model("Post", PostSchema);
export default Post;

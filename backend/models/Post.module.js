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
    type: {
      type: String,
      default: "video",
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
    hashTags: {
      type: [String], // Array of hash tags
      default: [],
    },
    mentions: {
      type: [mongoose.Schema.Types.ObjectId], // Mentions of other users
      ref: "users",
      default: [],
    },
    likedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users", // Users who liked the post
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
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

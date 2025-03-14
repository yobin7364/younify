import mongoose from "mongoose";

const { Schema } = mongoose;

// Comment Schema
const CommentSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", // The user who made the comment is required
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    likedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users", // Users who liked the post
      },
    ],
    mentions: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "users",
      default: [],
    },
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reply",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model("Comment", CommentSchema);
export default Comment;

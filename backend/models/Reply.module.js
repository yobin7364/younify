import mongoose from "mongoose";

const { Schema } = mongoose;

// Reply Schema
const ReplySchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
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
  },
  {
    timestamps: true,
  }
);

const Reply = mongoose.model("Reply", ReplySchema);
export default Reply;

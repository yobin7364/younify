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
    likes: {
      type: Number,
      default: 0,
    },
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

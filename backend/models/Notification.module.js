import { required } from "joi";
import mongoose from "mongoose";
const { Schema } = mongoose;

const NotificationSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true, // The user being notified
    },
    type: {
      type: String,
      enum: ["mention", "comment", "likedUsers"], // Different notification types
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post", // The post where the mention occurred
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false, // Whether the notification has been read
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;

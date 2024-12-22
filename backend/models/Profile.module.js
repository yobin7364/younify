import mongoose from "mongoose";
const { Schema } = mongoose;

const ProfileSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", // Links to the User model, "users" is collection
      required: true,
    },
    bio: {
      type: String,
      maxlength: 200, // Short description
    },
    avatar: {
      type: String, // Profile picture URL
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png", // Default image
    },
    location: {
      type: String, // City or Country
      maxlength: 50,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

const Profile = mongoose.model("profiles", ProfileSchema);
export default Profile;

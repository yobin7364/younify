import express from "express";
import Profile from "../models/Profile.module.js"; // Import the Profile model
import User from "../models/User.module.js"; // Import the User model if needed for validation
const router = express.Router();
import passport from "passport";

import { validateProfile } from "../validator/profile.validator.js";

import { upload, deleteFileFromS3 } from "../config/s3.config.js";

//this points to /api/users/test or any route ending with /test
//@route  GET /api/profile/test
//@desc   Tests post route
//@access Public
// Always put Public routes before Private routes, because authentication will be applied else to public route also
router.get("/test", (req, res) => res.json({ msg: "Profile Works" }));

// @route   GET /api/profile/all
// @desc    Get all profiles with user information
// @access  Public (you can adjust access level if needed)
router.get("/all", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", "name email avatar"); // Populate user details (name, email, avatar)

    if (!profiles) {
      return res.status(404).json({ message: "No profiles found" });
    }

    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

//@route  GET /api/profile
//@desc   Get current users profile
//@access Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const errors = {};

    const userId = req.user.id;

    try {
      const profile = await Profile.findOne({ user: userId }).populate(
        "user",
        "name email"
      ); // Populate user info (name, email) in profile data

      if (!profile) {
        errors.profile = "Profile not found";
        return res.status(404).json(errors);
      }

      res.json(profile);
    } catch (error) {
      res.status(500).json({ errorMsg: "Server error", error });
    }
  }
);

//@route  POST /api/profile
//@desc   Create users profile
//@access Private

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  upload.single("avatar"), // Multer middleware to handle single file upload (avatar)
  async (req, res) => {
    // Validate input
    const { errors, isValid } = validateProfile(req.body);

    // Check if validation fails
    if (!isValid) {
      return res.status(400).json({ message: "Invalid Field", errors });
    }

    const { bio, location, visibility } = req.body;

    // When using upload.single('avatar') with Multer, the uploaded file is available in the req.file object
    //This is the URL of the file uploaded to S3
    let avatar = req.file?.location;

    try {
      // Extract user from req.user (authenticated user)
      const user = req.user.id;

      // Check if the user already has a profile
      const existingProfile = await Profile.findOne({ user });
      if (existingProfile) {
        return res.status(400).json({ message: "Profile already exists" });
      }

      // Initialize followers and following as empty arrays
      const followers = [];
      const following = [];

      // Create and save the profile
      const profile = new Profile({
        user,
        bio,
        avatar,
        location,
        visibility,
        followers,
        following,
      });
      await profile.save();

      res
        .status(201)
        .json({ message: "Profile created successfully", profile });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

//@route  PUT /api/profile/:profileId
//@desc   Update users profile
//@access Private

// Route for handling profile updates (delete and upload)
router.put(
  "/:profileId",
  upload.single("avatar"), // Multer middleware to handle single file upload
  async (req, res) => {
    // Validate input
    const { errors, isValid } = validateProfile(req.body);

    // Check if validation fails
    if (!isValid) {
      return res.status(400).json({ message: "Invalid Field", errors });
    }

    const { profileId } = req.params;
    const { bio, location, visibility } = req.body;
    let avatar;

    try {
      // Fetch current profile
      const profile = await Profile.findById(profileId);

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // If the avatar is being removed (avatar is null and multer file is also null i.e req.file), delete the old image from S3
      if (!req.body.avatar && profile.avatar && !req.file) {
        await deleteFileFromS3(profile.avatar.split(".com/")[1]); // Extract S3 file key
        avatar = null; // Set avatar to null, meaning no avatar
      }

      // If a new avatar is uploaded, delete the old image from S3
      else if (req.file) {
        if (profile.avatar) {
          // If the profile already has an avatar, delete the old image from S3
          await deleteFileFromS3(profile.avatar.split(".com/")[1]); // Extract S3 file key
        }

        avatar = req.file.location; // New avatar URL from S3
      }

      // Keep existing avatar if no new file uploaded
      else {
        avatar = profile.avatar;
      }

      // Update profile with new bio, location, and avatar
      profile.bio = bio;
      profile.location = location;
      profile.avatar = avatar;
      profile.visibility = visibility;

      await profile.save();

      res.json({ message: "Profile updated successfully", profile });
    } catch (error) {
      console.error("Error updating profile", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
);

//@route  DELETE /api/profile/:profileId
//@desc   Delete users profile
//@access Private

router.delete(
  "/:profileId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const userId = req.user.id;
    const profileId = req.params.profileId;

    try {
      // Fetch current profile
      const profile = await Profile.findById(profileId);

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // if avatar available, delete it from s3
      if (profile.avatar) {
        await deleteFileFromS3(profile.avatar.split(".com/")[1]); // Extract S3 file key
      }

      // Delete the profile first
      await Profile.findOneAndDelete({ user: userId });

      // After deleting the profile, delete the associated user
      const user = await User.findByIdAndDelete(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "Profile and user deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

export default router;

import express from "express";
import Profile from "../models/Profile.module.js"; // Import the Profile model
import User from "../models/User.module.js"; // Import the User model if needed for validation
const router = express.Router();
import passport from "passport";

import { validateProfile } from "../validator/profile.validator.js";

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
  async (req, res) => {
    // Validate input
    const { errors, isValid } = validateProfile(req.body);

    // Check if validation fails
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const { bio, avatar, location } = req.body;

    try {
      // Extract user from req.user (authenticated user), and it is created by passport.js
      const user = req.user.id;

      // Check if the user already has a profile
      const existingProfile = await Profile.findOne({ user });

      if (existingProfile) {
        return res.status(400).json({ message: "Profile already exists" });
      }

      // Create and save the profile
      const profile = new Profile({ user, bio, avatar, location });
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

router.put(
  "/:profileId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    // Validate input
    const { errors, isValid } = validateProfile(req.body);

    // Check if validation fails
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const profileId = req.params.profileId; // Get profileId from URL parameters
    const { bio, avatar, location } = req.body;

    try {
      const profile = await Profile.findOneAndUpdate(
        { _id: profileId }, // Find profile by profileId
        { $set: { bio, avatar, location } }, // Update fields
        { new: true } // Return the updated profile
      );

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.json({ message: "Profile updated successfully", profile });
    } catch (error) {
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
    try {
      // Delete the profile first
      const profile = await Profile.findOneAndDelete({ user: userId });

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

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

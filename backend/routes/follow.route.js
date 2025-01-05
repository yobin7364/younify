import express from "express";
import Profile from "../models/Profile.module.js"; // Import the Profile model
const router = express.Router();
import passport from "passport";

//@route  POST /api/connect/follow/:userId
//@desc   Follow a user
//@access Private
router.post(
  "/follow/:userId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { userId } = req.params; // ID of the user to follow
      const user = req.user.id; // Authenticated user's ID, user who wants to follow

      if (userId === user) {
        return res.status(400).json({ message: "You cannot follow yourself" });
      }

      const targetProfile = await Profile.findOne({ user: userId });
      const userProfile = await Profile.findOne({ user });

      if (!targetProfile || !userProfile) {
        return res.status(404).json({ message: "User profile not found" });
      }

      // Add follower to the target user
      if (!targetProfile.followers.includes(user)) {
        targetProfile.followers.push(user);
      }

      // Add following to the authenticated user
      if (!userProfile.following.includes(userId)) {
        userProfile.following.push(userId);
      }

      await targetProfile.save();
      await userProfile.save();

      res.json({ message: "Successfully followed the user" });
    } catch (error) {
      console.error("Error following user:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
);

//@route  POST /api/connect/unfollow/:userId
//@desc   Unfollow a user
//@access Private
router.post(
  "/unfollow/:userId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { userId } = req.params; // ID of the profile to unfollow
      const user = req.user.id; // Authenticated user's ID

      const targetProfile = await Profile.findOne({ user: userId });
      const userProfile = await Profile.findOne({ user });

      if (!targetProfile || !userProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      if (userId === user) {
        return res
          .status(400)
          .json({ message: "You cannot unfollow yourself" });
      }

      // Remove follower from the target profile
      targetProfile.followers = targetProfile.followers.filter(
        (followerId) => followerId.toString() !== user.toString()
      );

      // Remove following from the authenticated user's profile
      userProfile.following = userProfile.following.filter(
        (followingId) => followingId.toString() !== userId.toString()
      );

      await targetProfile.save();
      await userProfile.save();

      res.json({
        message: "You have unfollowed this user",
        profile: targetProfile,
      });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
);

//@route  GET /api/connect/followers
//@desc   Get followers of a profile with pagination and query
//@access Private

router.get(
  "/followers",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = req.user.id; // Authenticated user's ID

    try {
      const { q } = req.query; // Search term

      // Pagination parameters (default values if not provided)
      const page = parseInt(req.query.page) || 1; // Default to page 1
      const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page

      // Calculate the number of items to skip
      const skip = (page - 1) * limit;

      // Find the profile by ID
      const profile = await Profile.findOne({ user });

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      if (!profile.followers || profile.followers.length === 0) {
        return res.json({
          followers: [],
          totalFollowers: 0,
          totalPages: 0,
          currentPage: page,
        });
      }

      // Aggregation pipeline to find followers and join with user data
      const followers = await Profile.aggregate([
        // Match followers of the current user
        {
          $match: {
            user: { $in: profile.followers }, // Filter for followers
          },
        },
        // Lookup to join 'users' collection for user details
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userDetails", // Join with 'users' collection
          },
        },
        { $unwind: "$userDetails" }, // Flatten the userDetails array
        // Add search filter if a query string is provided
        {
          $match: q
            ? {
                $or: [
                  { "userDetails.name": { $regex: q, $options: "i" } }, // Search by name
                  { bio: { $regex: q, $options: "i" } }, // Search by bio
                ],
              }
            : {}, // If no search term, match all
        },
        // Pagination logic
        { $skip: skip }, // Skip the number of documents for the current page
        { $limit: limit }, // Limit the number of documents per page
        // Project the fields to return
        {
          $project: {
            "userDetails.name": 1,
            "userDetails.email": 1,
            "userDetails.avatar": 1,
            bio: 1,
            avatar: 1,
            location: 1,
          },
        },
      ]);

      // Count total followers for pagination metadata
      const totalFollowers = await Profile.countDocuments({
        user: { $in: profile.followers },
      });

      res.json({
        followers,
        totalFollowers,
        totalPages: Math.ceil(totalFollowers / limit),
        currentPage: page,
      });
    } catch (error) {
      console.error("Error fetching followers", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
);

//@route  GET /api/connect/following
//@desc   Get following of a profile with pagination
//@access Private
router.get(
  "/following",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
      const { q } = req.query;
      const profile = await Profile.findOne({ user });

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      if (!profile.following || profile.following.length === 0) {
        return res.json({
          followings: [],
          totalFollowings: 0,
          totalPages: 0,
          currentPage: page,
        });
      }

      const query = { user: { $in: profile.following } };

      if (q) {
        query.$or = [
          { "user.name": { $regex: q, $options: "i" } },
          { bio: { $regex: q, $options: "i" } },
        ];
      }

      const followings = await Profile.aggregate([
        //$match filters the profiles to only include those where the user field matches one of the profile.following ID
        // user: { $in: profile.following},  means you’re finding Profile documents where the user is one of the users in profile.following
        // so out of all the users , only users available in profile.following is given
        //It is like saying, "Give me all the profiles where the user field matches an ID from the profile.following list."
        // It is similar to the find() method in MongoDB queries, but in an aggregation pipeline, it can be used to control which documents are passed to the next stage
        { $match: { user: { $in: profile.following } } }, // Filter followings
        {
          $lookup: {
            from: "users", // Reference collection name
            localField: "user", // Field in the 'Profile' collection to match
            foreignField: "_id", // Field in the 'users' collection to match
            as: "userDetails", // Output array field containing the matched user data
          },
        },
        { $unwind: "$userDetails" }, // Flatten user details (since we expect one match)
        {
          $match: {
            $or: [
              { "userDetails.name": { $regex: q, $options: "i" } }, // Match user name (case-insensitive)
              { bio: { $regex: q, $options: "i" } }, // Match bio (case-insensitive)
            ],
          },
        },
        { $skip: skip }, // Pagination: skip the number of documents for the current page
        { $limit: limit }, // Pagination: limit the number of documents per page
        {
          //selects only the necessary fields to return
          $project: {
            user: "$userDetails", // Project the 'userDetails' field as 'user'
            bio: 1, // Include the 'bio' field
            avatar: 1, // Include the 'avatar' field
            location: 1, // Include the 'location' field
          },
        },
      ]);

      const totalFollowings = await Profile.countDocuments(query);

      res.json({
        followings,
        totalFollowings,
        totalPages: Math.ceil(totalFollowings / limit),
        currentPage: page,
      });
    } catch (error) {
      console.error("Error fetching followings", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
);

export default router;

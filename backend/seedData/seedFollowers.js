import Profile from "../models/Profile.module.js"; // Import the Profile model

export const seedFollowers = async (user) => {
  try {
    const followersId = user.map((user) => user._id);

    const userId = followersId[0]; // ID of the user to follow

    const targetProfile = await Profile.findOne({ user: userId });

    for (let i = 1; i < followersId.length; i++) {
      const userProfile = await Profile.findOne({ user: followersId[i] });
      // Add following to the authenticated user
      if (!userProfile.following.includes(userId)) {
        userProfile.following.push(userId);
      }
      // Add follower to the target user
      if (!targetProfile.followers.includes(followersId[i])) {
        targetProfile.followers.push(followersId[i]);
      }
      await userProfile.save();
    }

    await targetProfile.save();

    console.log("Successfully followed the user");
  } catch (error) {
    console.error("Error following user:", error);
  }
};

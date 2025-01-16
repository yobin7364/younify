import express from "express";
const router = express.Router();
import passport from "passport";
import Post from "../models/Post.module.js";
import Comment from "../models/Comment.module.js";
import { validateComment } from "../validator/comment.validator.js";

//this points to /api/like/test or any route ending with /test
//@route  GET /api/like/test
//@desc   Tests like route
//@access Public
// Always put Public routes before Private routes, because authentication will be applied else to public route also
router.get("/test", (req, res) => res.json({ msg: "Like Works" }));

//@route  PUT /api/like/post/:postId
//@desc   Like a post
//@access Private
router.put(
  "/post/:postId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { postId } = req.params;
    const user = req.user.id; // Authenticated user's ID, user who wants to like

    try {
      await Post.findByIdAndUpdate(
        postId,
        { $addToSet: { likedUsers: user } }, // Add the user's ID only if it doesn't already exist
        { new: true } // Return the updated post document
      );

      res.json({ message: "Successfully liked the post" });
    } catch (error) {
      console.error("Error liking:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
);

//@route  PUT /api/like/post/unlike/:postId
//@desc   Unlike a post
//@access Private
router.put(
  "/post/unlike/:postId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { postId } = req.params;
    const user = req.user.id; // Authenticated user's ID, user who wants to like

    try {
      await Post.findByIdAndUpdate(
        postId,
        { $pull: { likedUsers: user } }, // Removed the user's ID
        { new: true } // Return the updated post document
      );

      res.json({ message: "Successfully unliked the post" });
    } catch (error) {
      console.error("Error unliking:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
);

//@route  GET /api/like/post/:postId
//@desc   Get likes of a post
//@access Private

router.get(
  "/post/:postId",
  passport.authenticate("jwt", { session: false }), // Ensure user is authenticated
  async (req, res) => {
    const { postId } = req.params;
    try {
      const post = await Post.findById(postId).populate(
        "likedUsers",
        "_id name email"
      );

      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.status(200).json({
        post,
      });
    } catch (error) {
      console.error("Error fetching post's like", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

//@route  PUT /api/like/comment/:commentId
//@desc   Like a comment
//@access Private
router.put(
  "/comment/:commentId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { commentId } = req.params;
    const user = req.user.id; // Authenticated user's ID, user who wants to like

    try {
      await Comment.findByIdAndUpdate(
        commentId,
        { $addToSet: { likedUsers: user } }, // Add the user's ID only if it doesn't already exist
        { new: true } // Return the updated post document
      );

      res.json({ message: "Successfully liked the comment" });
    } catch (error) {
      console.error("Error liking comment", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
);

//@route  PUT /api/like/comment/unlike/:commentId
//@desc   Like a comment
//@access Private
router.put(
  "/comment/unlike/:commentId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { commentId } = req.params;
    const user = req.user.id; // Authenticated user's ID, user who wants to like

    try {
      await Comment.findByIdAndUpdate(
        commentId,
        { $pull: { likedUsers: user } }, // Remove the user's ID
        { new: true } // Return the updated post document
      );

      res.json({ message: "Successfully unliked the comment" });
    } catch (error) {
      console.error("Error unliking comment", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
);

//@route  GET /api/like/comment/:commentId
//@desc   Get likes of a comment
//@access Private

router.get(
  "/comment/:commentId",
  passport.authenticate("jwt", { session: false }), // Ensure user is authenticated
  async (req, res) => {
    const { commentId } = req.params;
    try {
      const comment = await Comment.findById(commentId).populate(
        "likedUsers",
        "_id name email"
      );

      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.status(200).json({
        comment,
      });
    } catch (error) {
      console.error("Error fetching comment's like", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

export default router;

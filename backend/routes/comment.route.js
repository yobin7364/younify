import express from "express";
const router = express.Router();
import passport from "passport";
import Post from "../models/Post.module.js";
import Comment from "../models/Comment.module.js";
import { validateComment } from "../validator/comment.validator.js";

//this points to /api/comment/test or any route ending with /test
//@route  GET /api/comment/test
//@desc   Tests comment route
//@access Public
// Always put Public routes before Private routes, because authentication will be applied else to public route also
router.get("/test", (req, res) => res.json({ msg: "Comment Works" }));

//@route  POST /api/comment
//@desc   Comment a post
//@access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = req.user.id; // Authenticated user's ID, user who wants to comment

    // Validate input using Joi
    const { errors, isValid } = validateComment(req.body);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid data", errors });
    }

    // Extract post data from request
    const { postId, content, mentions } = req.body;

    try {
      // Create comment
      const newComment = new Comment({
        user,
        content,
        mentions,
      });

      const savedComment = await newComment.save();

      // Update the post's comment
      await Post.findByIdAndUpdate(
        postId,
        { $push: { comments: savedComment._id } }, // Add comment ID to the array
        { new: true } // Return the updated post document
      );

      res.json({ message: "Successfully commented the post" });
    } catch (error) {
      console.error("Error commenting:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
);

//@route  GET /api/comment/:postId
//@desc   Get comments
//@access Private

router.get(
  "/:postId",
  passport.authenticate("jwt", { session: false }), // Ensure user is authenticated
  async (req, res) => {
    const { postId } = req.params;
    try {
      const post = await Post.findById(postId).populate("comments");

      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      res.status(200).json({
        post,
      });
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

//@route  PUT /api/comment/:commentId
//@desc   Edit Comment a comment by commentor
//@access Private
router.put(
  "/:commentId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = req.user.id; // Authenticated user's ID, user who wants to comment
    const { commentId } = req.params;

    // Validate input using Joi
    const { errors, isValid } = validateComment(req.body);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid data", errors });
    }

    // Extract post data from request
    const { postId, content, mentions } = req.body;

    try {
      //Find the comment
      const getComment = await Comment.findOne({ _id: commentId });

      if (!getComment) {
        res.json({ message: "Comment not found" });
      }

      // if editor is not the one who created the comment
      if (getComment.user.toString() !== user) {
        res.json({ message: "User is not authorized to edit the comment" });
      }

      getComment.content = content;
      getComment.mentions = mentions;

      await getComment.save();

      res.json({ message: "Successfully Updated the Comment" });
    } catch (error) {
      console.error("Error updating commenting:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
);

//@route  DELETE /api/comment/:postId/:commentId
//@desc   Delete a comment by commentor or post author
//@access Private
router.delete(
  "/:postId/:commentId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = req.user.id; // Authenticated user's ID, user who wants to comment
    const { postId, commentId } = req.params;

    try {
      //Find the comment
      const getComment = await Comment.findOne({ _id: commentId });

      if (!getComment) {
        res.json({ message: "Comment not found" });
      }

      // Find post
      const post = await Post.findById(postId);

      if (!post) {
        res.json({ message: "Post not found" });
      }

      // cannot delete if editor is not the one who created the comment or the main post author
      if (
        getComment.user.toString() !== user &&
        post.author.toString() !== user
      ) {
        res.json({ message: "User is not authorized to edit the comment" });
      }

      await Comment.findOneAndDelete({ _id: commentId });

      // Remove the post's comment id foe deelted comment
      await Post.findByIdAndUpdate(
        postId,
        { $pull: { comments: commentId } }, // Remove comment ID from the array
        { new: true } // Return the updated post document
      );

      res.json({ message: "Successfully Deleted the Comment" });
    } catch (error) {
      console.error("Error deleting commenting:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
);

export default router;

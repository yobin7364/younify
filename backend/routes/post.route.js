import express from "express";
import Post from "../models/Post.module.js"; // Import the Profile model
const router = express.Router();
import passport from "passport";

import { validatePost } from "../validator/post.validator.js";

import { upload, deleteFileFromS3 } from "../config/s3.config.js";
import multer from "multer";

//this points to /api/post/test or any route ending with /test
//@route  GET /api/post/test
//@desc   Tests post route
//@access Public
// Always put Public routes before Private routes, because authentication will be applied else to public route also
router.get("/test", (req, res) => res.json({ msg: "Post Works" }));

//@route  GET /api/post/:id
//@desc   Get a post by ID
//@access Public

router.get("/:id", async (req, res) => {
  const postId = req.params.id;

  try {
    // Find post by ID
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Post retrieved successfully", post });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//@route  GET /api/post
//@desc   Get all posts with pagination
//@access Public

router.get("/", async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Get pagination parameters

  try {
    const posts = await Post.find()
      .skip((page - 1) * limit) // Skip posts for the current page
      .limit(limit) // Limit number of posts per page
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({ message: "Posts retrieved successfully", posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//@route  GET /api/post/search
//@desc   Get posts with search query
//@access Public

router.get("/search", async (req, res) => {
  const { query, page = 1, limit = 10 } = req.query; // Extract query, page, and limit

  const searchQuery = {
    $or: [
      { title: { $regex: query, $options: "i" } }, // Case-insensitive search in title
      { content: { $regex: query, $options: "i" } }, // Case-insensitive search in content
      { hashTags: { $regex: query, $options: "i" } }, // Case-insensitive search in hashtags
    ],
  };

  try {
    // Fetch posts with pagination
    const posts = await Post.find(searchQuery)
      .skip((page - 1) * limit) // Skip for pagination
      .limit(limit) // Limit the number of posts per page
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({ message: "Posts retrieved successfully", posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//@route  GET /api/post/myPosts
//@desc   Get posts for logged-in user
//@access Private

router.get(
  "/myPosts",
  passport.authenticate("jwt", { session: false }), // Ensure user is authenticated
  async (req, res) => {
    try {
      // Find posts created by the logged-in user (using req.user.id), createdAt: -1 means sort post by latest post
      const posts = await Post.find({ author: req.user.id }).sort({
        createdAt: -1,
      });

      if (posts.length === 0) {
        return res
          .status(404)
          .json({ message: "No posts found for this user" });
      }

      res.status(200).json({ message: "Posts retrieved successfully", posts });
    } catch (error) {
      console.error("Error fetching user's posts:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

//@route  POST /api/post
//@desc   Create post
//@access Private

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    // Use Multer middleware to handle file uploads (up to 10 files)
    upload.array("media", 10)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer-specific errors
        return res
          .status(400)
          .json({ message: "Multer error", error: err.message });
      } else if (err) {
        // Other errors
        return res
          .status(400)
          .json({ message: "File upload error", error: err.message });
      }
      next(); // Proceed if no errors
    });
  },
  async (req, res) => {
    // Validate input using Joi
    const { errors, isValid } = validatePost(req.body);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid data", errors });
    }

    // Extract post data from request
    const { title, content, type, author, hashTags, mentions } = req.body;

    // Handle uploaded file (if any)
    let media = [];
    if (req.files && req.files.length > 0) {
      // If there are files, map them to their S3 URLs
      media = req.files.map((file) => file.location); // S3 file URL
    }

    try {
      // Create and save the post
      const post = new Post({
        title,
        content,
        author: req.user.id, // Use authenticated user as the author
        media,
        hashTags,
        mentions,
      });
      await post.save();

      res.status(201).json({ message: "Post created successfully", post });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

//@route  PUT /api/post/:id
//@desc   Update post (with media removal)
//@access Private

router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    // Use Multer middleware to handle file uploads (up to 10 files)
    upload.array("media", 10)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer-specific errors
        return res
          .status(400)
          .json({ message: "Multer error", error: err.message });
      } else if (err) {
        // Other errors
        return res
          .status(400)
          .json({ message: "File upload error", error: err.message });
      }
      next(); // Proceed if no errors
    });
  },
  async (req, res) => {
    // Validate input using Joi
    const { errors, isValid } = validatePost(req.body);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid data", errors });
    }

    // Extract post data from request
    const { title, content, removedMedia, hashTags, mentions } = req.body;

    // Handle uploaded file (if any)
    let media = [];
    if (req.files && req.files.length > 0) {
      // If there are files, map them to their S3 URLs
      media = req.files.map((file) => file.location); // S3 file URL
    }

    try {
      // Fetch the post to update it
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // If there are removed media, delete them from S3
      if (removedMedia && removedMedia.length > 0) {
        for (const mediaKey of removedMedia) {
          // Delete the file from S3
          await deleteFileFromS3(mediaKey.split(".com/")[1]); // Extract the S3 file key
        }
        // Update the post media by removing the deleted files
        post.media = post.media.filter((file) => !removedMedia.includes(file));
      }

      // Update the post fields
      post.title = title;
      post.content = content;
      post.hashTags = hashTags;
      post.mentions = mentions;

      // Add new media if uploaded
      if (media.length > 0) {
        post.media.push(...media); // Add new media to the existing media array
      }

      // Save the updated post
      await post.save();

      res.status(200).json({ message: "Post updated successfully", post });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

//@route  DELETE /api/post/:id
//@desc   Delete post and associated media from S3
//@access Private

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }), // Ensure the user is authenticated
  async (req, res) => {
    const postId = req.params.id;

    try {
      // Find the post by ID
      const post = await Post.findById(postId);

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Check if the current user is the author of the post
      if (post.author.toString() !== req.user.id) {
        return res
          .status(403)
          .json({ message: "You are not authorized to delete this post" });
      }

      // If the post has media files, remove them from S3
      if (post.media && post.media.length > 0) {
        for (let mediaUrl of post.media) {
          const mediaKey = mediaUrl.split(".com/")[1]; // Extract the S3 file key
          await deleteFileFromS3(mediaKey); // Call function to delete from S3
        }
      }

      // Delete the post from the database
      await Post.findOneAndDelete({ _id: postId });

      res
        .status(200)
        .json({ message: "Post and associated media deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

export default router;

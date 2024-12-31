import express from "express";
import Post from "../models/Post.module.js"; // Import the Profile model
const router = express.Router();
import passport from "passport";

import { validatePost } from "../validator/post.validator.js";

import { upload, deleteFileFromS3 } from "../config/s3.config.js";

//this points to /api/post/test or any route ending with /test
//@route  GET /api/post/test
//@desc   Tests post route
//@access Public
// Always put Public routes before Private routes, because authentication will be applied else to public route also
router.get("/test", (req, res) => res.json({ msg: "Post Works" }));

export default router;

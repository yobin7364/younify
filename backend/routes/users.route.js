import express from "express";
const router = express.Router();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import keys from "../config/keys.config.js";
import passport from "passport";
import { validateRegistration } from "../validator/register.validator.js";
import { validateLoginInput } from "../validator/login.validator.js";
import User from "../models/User.module.js";

// Access the secretOrKey from the dynamically imported keys
const secret = keys.secretOrKey;

//this points to /api/users/test or any route ending with /test
//@route  GET /api/users/test
//@desc   Tests post route
//@access Public
router.get("/test", (req, res) => res.json({ msg: "User Works" }));

// @route  POST /api/users/register
// @desc   Register user
// @access Public
router.post("/register", async (req, res) => {
  const { errors, isValid } = validateRegistration(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    }

    // Create new user instance
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    // Hash password and save user
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(newUser.password, salt);

    const savedUser = await newUser.save();
    return res.json(savedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route  POST /api/users/login
// @desc   Login user
// @access Public
router.post("/login", (req, res) => {
  // Validate input
  const { errors, isValid } = validateLoginInput(req.body);

  // Check if validation fails
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { email, password } = req.body;

  // Find user by email
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        errors.email = "User not found";
        return res.status(400).json(errors);
      }

      // Check password
      bcrypt.compare(password, user.password).then((isMatch) => {
        if (isMatch) {
          // User matched
          const payload = { id: user.id, name: user.name }; // JWT payload without avatar

          // Sign token
          jwt.sign(payload, secret, { expiresIn: 36000 }, (err, token) => {
            if (err) {
              return res.status(500).json({ error: "Error signing the token" });
            }

            res.json({
              success: true,
              token: "Bearer " + token, // Bearer token with a space after 'Bearer'
            });
          });
        } else {
          errors.password = "Password incorrect";
          return res.status(400).json(errors);
        }
      });
    })
    .catch((err) => {
      res.status(500).json({ error: "Server error" });
    });
});

//@route  GET /api/users/current
//@desc   Return current user
//@access Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    });
  }
);

export default router;

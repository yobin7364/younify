import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import keys from "./config/keys.config.js";
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import users from "./routes/users.route.js";
import profile from "./routes/profile.route.js";
import post from "./routes/post.route.js";
import follow from "./routes/follow.route.js";
import comment from "./routes/comment.route.js";
import like from "./routes/like.route.js";

dotenv.config();

const app = express();

// Initialize Passport strategy
initializePassport();

// Initialize Passport middleware
app.use(passport.initialize());

//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const mongoURI = keys.mongoURI;

//connect to mongoDB
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Mongoose connection error:", err));

//Use routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/post", post);
app.use("/api/connect", follow);
app.use("/api/comment", comment);
app.use("/api/like", like);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

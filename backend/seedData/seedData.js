import mongoose from "mongoose";
import { seedUsers } from "./userSeed.js"; // Import user seed function
import { seedProfilesData } from "./profileSeed.js"; // Import profile seed function
import { seedFollowers } from "./seedFollowers.js";
import keys from "../config/keys.config.js";
import User from "../models/User.module.js";

const mongoURI = keys.mongoURI;

mongoose.connect(mongoURI);

const seedData = async () => {
  try {
    // Seed users first
    await seedUsers();

    // Fetch the users after seeding to link profiles to them
    const users = await User.find();

    // Seed profiles after users are created
    await seedProfilesData(users);

    // Seed Followers
    await seedFollowers(users);

    console.log("Data seeding completed!");
    mongoose.disconnect(); // Disconnect from the database once seeding is done
  } catch (err) {
    console.error("Error while seeding data:", err);
  }
};

// Run the seed data function
seedData();

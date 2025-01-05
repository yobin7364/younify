import bcrypt from "bcrypt";
import User from "../models/User.module.js"; // Adjust path accordingly
import { faker } from "@faker-js/faker"; // For generating random names and emails
import keys from "../config/keys.config.js";

const mongoURI = keys.mongoURI;

// Function to generate users
export const seedUsers = async () => {
  try {
    // Remove all existing users in the collection to avoid duplication
    await User.deleteMany();

    // Create 20 dummy users
    const users = [];
    for (let i = 0; i < 20; i++) {
      const name = faker.person.fullName();
      const email = faker.internet.email();
      const password = "password123";

      // Check if user already exists (in case of duplicate email)
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log(`User with email ${email} already exists.`);
        continue;
      }

      // Hash password before saving the user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user object
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
      });

      users.push(newUser);
    }

    // Save users to DB
    await User.insertMany(users);
    console.log("Users created successfully!");
  } catch (err) {
    console.error("Error while seeding users:", err);
  }
};

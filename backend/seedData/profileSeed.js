import Profile from "../models/Profile.module.js"; // Adjust path accordingly
import crypto from "crypto";

// Function to generate Gravatar URL from email
const generateGravatarUrl = (email) => {
  const emailHash = crypto.createHash("md5").digest("hex");
  return `https://www.gravatar.com/avatar/${emailHash}?s=200&d=identicon`;
};

const seedProfiles = [
  {
    bio: "I am a web developer specializing in JavaScript frameworks.",
    location: "New York, USA",
    isPublic: true,
    avatar: generateGravatarUrl("example1@example.com"),
  },
  {
    bio: "Data scientist with a passion for machine learning.",
    location: "London, UK",
    isPublic: false,
    avatar: generateGravatarUrl("example2@example.com"),
  },
  {
    bio: "UI/UX designer who loves creating beautiful interfaces.",
    location: "Sydney, Australia",
    isPublic: true,
    avatar: generateGravatarUrl("example3@example.com"),
  },
  {
    bio: "Software engineer working with cloud technologies.",
    location: "San Francisco, USA",
    isPublic: true,
    avatar: generateGravatarUrl("example4@example.com"),
  },
  {
    bio: "Graphic designer with an eye for minimalistic designs.",
    location: "Berlin, Germany",
    isPublic: false,
    avatar: generateGravatarUrl("example5@example.com"),
  },
  {
    bio: "Content writer and digital marketing specialist.",
    location: "Toronto, Canada",
    isPublic: true,
    avatar: generateGravatarUrl("example6@example.com"),
  },
  {
    bio: "Experienced product manager with a passion for tech.",
    location: "Barcelona, Spain",
    isPublic: false,
    avatar: generateGravatarUrl("example7@example.com"),
  },
  {
    bio: "Full-stack developer working on modern web applications.",
    location: "Mumbai, India",
    isPublic: true,
    avatar: generateGravatarUrl("example8@example.com"),
  },
  {
    bio: "Machine learning enthusiast and data analyst.",
    location: "Melbourne, Australia",
    isPublic: true,
    avatar: generateGravatarUrl("example9@example.com"),
  },
  {
    bio: "Blockchain developer interested in decentralized apps.",
    location: "Singapore",
    isPublic: false,
    avatar: generateGravatarUrl("example10@example.com"),
  },
  {
    bio: "Creative technologist building interactive web experiences.",
    location: "Paris, France",
    isPublic: true,
    avatar: generateGravatarUrl("example11@example.com"),
  },
  {
    bio: "Web designer with a passion for user-centered design.",
    location: "Los Angeles, USA",
    isPublic: false,
    avatar: generateGravatarUrl("example12@example.com"),
  },
  {
    bio: "App developer and entrepreneur.",
    location: "Austin, USA",
    isPublic: true,
    avatar: generateGravatarUrl("example13@example.com"),
  },
  {
    bio: "Cybersecurity analyst focused on threat prevention.",
    location: "Berlin, Germany",
    isPublic: true,
    avatar: generateGravatarUrl("example14@example.com"),
  },
  {
    bio: "Digital strategist helping businesses grow online.",
    location: "New York, USA",
    isPublic: false,
    avatar: generateGravatarUrl("example15@example.com"),
  },
  {
    bio: "AI researcher focused on deep learning models.",
    location: "Seattle, USA",
    isPublic: true,
    avatar: generateGravatarUrl("example16@example.com"),
  },
  {
    bio: "Frontend developer working with React and Vue.",
    location: "Dublin, Ireland",
    isPublic: true,
    avatar: generateGravatarUrl("example17@example.com"),
  },
  {
    bio: "DevOps engineer ensuring smooth deployments.",
    location: "Stockholm, Sweden",
    isPublic: false,
    avatar: generateGravatarUrl("example18@example.com"),
  },
  {
    bio: "Virtual reality developer and enthusiast.",
    location: "Los Angeles, USA",
    isPublic: true,
    avatar: generateGravatarUrl("example19@example.com"),
  },
  {
    bio: "Software developer building scalable web apps.",
    location: "Tokyo, Japan",
    isPublic: true,
    avatar: generateGravatarUrl("example20@example.com"),
  },
];

export const seedProfilesData = async (users) => {
  try {
    // Remove all existing profile in the collection to avoid duplication
    await Profile.deleteMany();
    // For each user, create one profile
    const profiles = users.map((user, index) => {
      const profileData = seedProfiles[index % seedProfiles.length];

      return {
        user: user._id, // Link the profile to the user
        bio: profileData.bio,
        location: profileData.location,
        isPublic: profileData.isPublic,
        avatar: profileData.avatar,
        followers: [],
        following: [],
      };
    });

    // Insert profiles into DB
    await Profile.insertMany(profiles);
    console.log("Profiles created successfully!");
  } catch (err) {
    console.error("Error while seeding profiles:", err);
  }
};

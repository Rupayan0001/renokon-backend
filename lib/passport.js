import passport from "passport";
import Strategy from "passport-google-oauth20";
import Usermodel from "../model/user.model.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import Wallet from "../model/game_model/wallet.model.js";
import axios from "axios";
import cloudinary from "./../lib/cloudinary.js";
import streamifier from "streamifier";
import Point from "../model/game_model/point.model.js";
const GoogleStrategy = Strategy.Strategy;
const NODE_ENV = process.env.NODE_ENV;
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: NODE_ENV === "production" ? process.env.GOOGLE_CALLBACK : "http://localhost:5000/api/v1/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const { id, displayName, emails, photos } = profile;
      let user = await Usermodel.findOne({ email: emails[0].value });
      if (!user) {
        try {
          const randomPassword = uuidv4();
          const hashedPassword = await bcrypt.hash(randomPassword, 10);
          const random = Math.floor(Math.random() * 900000);
          const profilePicUrl = photos[0].value;
          const cloudinaryUrl = await uploadImageFromUrl(profilePicUrl);
          const defaultUsername = `@${displayName.toLowerCase().split(" ")[0]}_${random}`;
          user = await Usermodel.create({
            name: displayName,
            email: emails[0].value,
            profilePic: cloudinaryUrl,
            username: defaultUsername,
            password: hashedPassword,
            bannerPic: `https://res.cloudinary.com/dkuxqgbvt/image/upload/v1730308958/abstract-background-design-dark-gray_53876-59277_kwr9w9.avif`,
            dateOfBirth: "",
            headline: "",
            about: "",
            skills: "",
            loaction: "",
            experience: {},
            education: {},
            status: "verified",
          });
        } catch (err) {
          if (err.code === 11000) {
            const randomPassword = uuidv4();
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            const random = Math.floor(Math.random() * 90000);
            const defaultUsername = `@${displayName.toLowerCase().split(" ")[0]}_${random}`;
            user = await Usermodel.create({
              name: displayName,
              email: emails[0].value,
              profilePic: photos[0].value,
              username: defaultUsername,
              password: hashedPassword,
              bannerPic: `https://res.cloudinary.com/dkuxqgbvt/image/upload/v1730308958/abstract-background-design-dark-gray_53876-59277_kwr9w9.avif`,
              dateOfBirth: "",
              headline: "",
              about: "",
              skills: "",
              location: "",
              experience: {},
              education: {},
              status: "verified",
            });
          }
        }
        try {
          await Wallet.create({ userId: user._id });
        } catch (err) {}
        try {
          await Point.create({ userId: user._id, point: 1000 });
          console.log("point created");
        } catch (err) {}
      }

      return done(null, user);
    }
  )
);

export const uploadImageFromUrl = async (imageUrl, folder = "myUploads") => {
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "binary");

    return new Promise((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
        if (err) {
          console.log(`Error uploading image from URL: ${err}`);
          return resolve("https://res.cloudinary.com/dkuxqgbvt/image/upload/v1730308932/0d64989794b1a4c9d89bff571d3d5842-modified_bl9aus.png");
        }
        return resolve(result.secure_url);
      });

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  } catch (err) {
    console.log(`Error uploading image from URL: ${err}`);
    return "https://res.cloudinary.com/dkuxqgbvt/image/upload/v1730308932/0d64989794b1a4c9d89bff571d3d5842-modified_bl9aus.png";
  }
};

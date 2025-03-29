import passport from "passport";
import Strategy from "passport-google-oauth20";
import Usermodel from "../model/user.model.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import Wallet from "../model/game_model/wallet.model.js";
// import pkg from "uuidv4";
// const { v4: uuidv4 } = pkg;
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
        const randomPassword = uuidv4();
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        user = await Usermodel.create({
          name: displayName,
          email: emails[0].value,
          profilePic: photos[0].value,
          username: "",
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
      }
      await Wallet.create({ userId: user._id });

      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

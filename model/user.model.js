import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      default: "",
      index: true,
    },
    status: {
      type: String,
      default: "not verified",
    },
    profilePic: {
      type: String,
      default: "",
    },
    dateOfBirth: {
      type: String,
    },
    bannerPic: {
      type: String,
      default: "",
    },
    headline: {
      type: String,
      default: "",
    },
    about: {
      type: String,
      default: "",
    },
    skills: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    experince: [
      {
        title: String,
        startDate: Date,
        endDate: Date,
        company: String,
        description: String,
      },
    ],
    school: String,
    city: String,
    college: String,
    job: String,
    exp: String,
    education: [
      {
        school: String,
        fieldOfStudy: String,
        startDate: Number,
        endDate: Number,
      },
    ],
    followingCount: {
      type: Number,
      default: 0,
    },
    followerCount: {
      type: Number,
      default: 0,
    },
    friendsCount: {
      type: Number,
      default: 0,
    },
    accountType: {
      type: String,
      // Personal or Business
    },
    lastSeenOnMessage: {
      type: Date,
    },
  },
  { timestamps: true }
);

const reportedUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  whoReported: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  reportedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  report: {
    type: String,
    default: "",
  },
});

const UserModel = mongoose.model("User", userSchema);
export const ReportedUserModel = mongoose.model("ReportedUser", reportedUserSchema);
export default UserModel;

// blocklist: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   ],
//   posts: [
//     {
//       postId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Post",
//       },
//       createdAt: {
//         type: Date,
//         default: Date.now,
//       },
//     },
//   ],

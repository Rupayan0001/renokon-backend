import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    postCreator: {
      type: String,
      required: true,
    },
    creatorProfilePic: {
      type: String,
    },
    image: {
      type: [String],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    sharesCount: {
      type: Number,
      default: 0,
    },
    audience: {
      type: String,
      default: "Everyone",
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    postTextContent: {
      type: String,
      default: "",
    },
    video: {
      type: [String],
    },

    // For polls

    question: {
      type: String,
    },
    option1: {
      type: String,
    },
    option2: {
      type: String,
    },
    votesOnOption1: {
      type: Number,
      default: 0,
    },
    votesOnOption2: {
      type: Number,
      default: 0,
    },
    totalVotes: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
    },
    voters: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        vote: { type: String },
      },
    ],
  },
  { timestamps: true }
);

PostSchema.index({ userId: 1 }, { unique: true });
const Postmodel = mongoose.model("Post", PostSchema);
export default Postmodel;

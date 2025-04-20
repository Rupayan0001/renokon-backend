import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
    },
    creatorName: {
      type: String,
    },
    creatorProfilePic: {
      type: String,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    reelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reel",
    },
    postCreatorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    media: {
      type: [String],
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
CommentSchema.index({ postId: 1 }, { unique: true });
const Commentmodel = mongoose.model("Comment", CommentSchema);
export default Commentmodel;

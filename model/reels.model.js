import mongoose from "mongoose";

const ReelsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    videoLink: {
      type: String,
      required: true,
    },
    productLink: {
      type: String,
    },
    productImage: {
      type: String,
    },
    productTitle: {
      type: String,
    },
    thumbnailLink: {
      type: String,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

ReelsSchema.index({ userId: 1 });

const ReelsModel = mongoose.model("Reels", ReelsSchema);
export default ReelsModel;

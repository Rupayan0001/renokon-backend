import mongoose from "mongoose";

const JoinedPoolSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    gamePoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gamepool",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "live", "completed"],
      default: "active",
    },
    draw: {
      type: Boolean,
      default: false,
    },
    gameStartTime: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const JoinedPoolModel = mongoose.model("JoinedPool", JoinedPoolSchema);
export default JoinedPoolModel;

import mongoose from "mongoose";

const GamePoolSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
    },
    totalPoolAmount: {
      type: String,
      required: true,
    },
    joinedPlayers: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    maxPlayers: {
      type: Number,
      required: true,
      min: 1,
    },
    entryFee: {
      type: Number,
      required: true,
    },
    winningChance: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    firstPrize: {
      type: String,
      required: true,
      trim: true,
    },
    full: {
      type: Boolean,
    },
    status: {
      type: String,
      enum: ["active", "completed", "live"],
      default: "active",
    },
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    gameTime: {
      type: Date,
      required: true,
      index: true,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cheatPlayer: {
      type: mongoose.Schema.Types.ObjectId,
    },
    draw: {
      type: Boolean,
      default: false,
    },
    prize_distribution: [
      {
        rank_range: {
          type: String,
          required: true,
          min: 1,
        },
        prize: {
          type: String,
          required: true,
          min: 1,
        },
      },
    ],
  },
  { timestamps: true }
);

const Gamemodel = mongoose.model("Gamepool", GamePoolSchema);

export default Gamemodel;

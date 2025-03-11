import mongoose from "mongoose";

const gameStateSchema = new mongoose.Schema(
  {
    poolId: { type: mongoose.Schema.Types.ObjectId, ref: "Pool", required: true },
    players: {
      player1: {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        score: { type: Number, default: 0 },
        answers: [
          {
            questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Mathsquestions", required: true },
            answer: { type: String, required: true },
            isCorrect: { type: Boolean, required: true },
            correct_answer: { type: String, required: true },
          },
        ],
      },
      player2: {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        score: { type: Number, default: 0 },
        answers: [
          {
            questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Mathsquestions", required: true },
            answer: { type: String, required: true },
            isCorrect: { type: Boolean, required: true },
            correct_answer: { type: String, required: true },
          },
        ],
      },
    },
    questions: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correct_answer: { type: String, required: true },
      },
    ],
    status: { type: String, enum: ["pending", "active", "completed"], default: "completed" },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    draw: {
      type: Boolean,
      default: false,
    },
    cheatplayer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verification: { type: String, enum: ["pending", "verified"], default: "pending" },
    winningAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const GameState = mongoose.model("GameState", gameStateSchema);

export default GameState;
